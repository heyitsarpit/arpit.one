import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, extname, relative, resolve, sep } from 'node:path'

import { exiftool } from 'exiftool-vendored'
import sharp from 'sharp'

const DEFAULT_INPUT = '/Users/arpit/Pictures/images'
const DEFAULT_OUTPUT = '.art-preview'
const DEFAULT_BUCKET = 'arpit-one-art'
const DEFAULT_PREFIX = 'art'
const GPS_KEY = /^gps/i
const SERIAL_KEY = /serial/i
const IMAGE_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.heic',
  '.heif',
  '.tif',
  '.tiff',
  '.webp'
])

const args = process.argv.slice(2)
const valueAfter = (flag, fallback) => {
  const index = args.indexOf(flag)
  return index === -1 ? fallback : (args[index + 1] ?? fallback)
}

const inputDir = resolve(
  valueAfter('--input', process.env.ART_INPUT_DIR ?? DEFAULT_INPUT)
)
const outputDir = resolve(
  valueAfter('--output', process.env.ART_OUTPUT_DIR ?? DEFAULT_OUTPUT)
)
const bucket = valueAfter(
  '--bucket',
  process.env.ART_R2_BUCKET ?? DEFAULT_BUCKET
)
const prefix = valueAfter(
  '--prefix',
  process.env.ART_R2_PREFIX ?? DEFAULT_PREFIX
)
const quality = Number(
  valueAfter('--quality', process.env.ART_AVIF_QUALITY ?? '55')
)
const effort = Number(
  valueAfter('--effort', process.env.ART_AVIF_EFFORT ?? '5')
)
const shouldUpload = args.includes('--upload')
const shouldUploadMetadata = args.includes('--upload-metadata')

if (!existsSync(inputDir)) {
  throw new Error(`Input directory does not exist: ${inputDir}`)
}

if (!Number.isInteger(quality) || quality < 1 || quality > 100) {
  throw new Error('--quality must be an integer from 1 to 100')
}

if (!Number.isInteger(effort) || effort < 0 || effort > 9) {
  throw new Error('--effort must be an integer from 0 to 9')
}

const toPosix = (path) => path.split(sep).join('/')

const walk = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) files.push(...(await walk(path)))
    else if (
      entry.isFile() &&
      IMAGE_EXTENSIONS.has(extname(entry.name).toLowerCase())
    ) {
      files.push(path)
    }
  }

  return files.sort()
}

const bytesToMiB = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MiB`
const percentSaved = (original, converted) =>
  original === 0 ? 0 : ((original - converted) / original) * 100

const jsonReplacer = (_key, value) => {
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'bigint') return value.toString()
  return value
}

const upload = (file, key, contentType) => {
  const result = spawnSync(
    'wrangler',
    [
      'r2',
      'object',
      'put',
      `${bucket}/${key}`,
      '--file',
      file,
      '--content-type',
      contentType,
      '--cache-control',
      'public, max-age=31536000, immutable',
      '--remote'
    ],
    { stdio: 'inherit' }
  )

  if (result.status !== 0) {
    throw new Error(`Wrangler upload failed for ${key}`)
  }
}

await mkdir(outputDir, { recursive: true })
const avifDir = resolve(outputDir, 'avif')
const metadataDir = resolve(outputDir, 'metadata')
const publicMetadataDir = resolve(outputDir, 'public-metadata')
await mkdir(avifDir, { recursive: true })
await mkdir(metadataDir, { recursive: true })
await mkdir(publicMetadataDir, { recursive: true })

const files = await walk(inputDir)
if (files.length === 0)
  throw new Error(`No supported images found in ${inputDir}`)

const manifest = {
  generatedAt: new Date().toISOString(),
  inputDir,
  outputDir,
  quality,
  effort,
  bucket,
  prefix,
  uploaded: shouldUpload,
  uploadedMetadata: shouldUpload && shouldUploadMetadata,
  assets: []
}

const compactObject = (object) =>
  Object.fromEntries(
    Object.entries(object).filter(
      ([, value]) => value !== undefined && value !== null && value !== ''
    )
  )

const numericValue = (value) => {
  if (typeof value === 'number') return value
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : value
}

const apertureValue = (value) => {
  const number = numericValue(value)
  return typeof number === 'number' ? `f/${number}` : number
}

const captureMonth = (value) => {
  const rawValue = value?.rawValue ?? value
  return typeof rawValue === 'string'
    ? rawValue.slice(0, 7).replace(':', '-')
    : undefined
}

const captureDate = (value) => {
  const rawValue = value?.rawValue ?? value
  return typeof rawValue === 'string'
    ? rawValue.slice(0, 10).replaceAll(':', '-')
    : undefined
}

for (const inputFile of files) {
  const relativeInput = toPosix(relative(inputDir, inputFile))
  const relativeStem = toPosix(
    relativeInput.slice(0, -extname(relativeInput).length)
  )
  const outputFile = resolve(avifDir, `${relativeStem}.avif`)
  const metadataFile = resolve(metadataDir, `${relativeInput}.json`)
  const publicMetadataFile = resolve(publicMetadataDir, `${relativeInput}.json`)

  await mkdir(dirname(outputFile), { recursive: true })
  await mkdir(dirname(metadataFile), { recursive: true })
  await mkdir(dirname(publicMetadataFile), { recursive: true })

  const originalStat = await readFile(inputFile)
  const source = sharp(originalStat)
  const sourceMetadata = await source.metadata()
  const rawTags = await exiftool.read(inputFile)
  const { SourceFile: _sourceFile, ...exif } = rawTags

  await source
    .rotate()
    .avif({ quality, effort, chromaSubsampling: '4:2:0' })
    .toFile(outputFile)

  const convertedStat = await readFile(outputFile)
  const convertedMetadata = await sharp(convertedStat).metadata()
  const sha256 = createHash('sha256').update(convertedStat).digest('hex')
  const fingerprint = sha256.slice(0, 12)
  const exifKeys = Object.keys(exif).sort()
  const metadata = {
    source: relativeInput,
    format: sourceMetadata.format,
    width: convertedMetadata.width,
    height: convertedMetadata.height,
    exif,
    exifKeys,
    privacyFlags: {
      containsGps: exifKeys.some((key) => GPS_KEY.test(key)),
      containsSerialNumber: exifKeys.some((key) => SERIAL_KEY.test(key))
    }
  }

  const photography = {
    camera: compactObject({
      make: exif.Make,
      model: exif.Model
    }),
    lens: compactObject({
      make: exif.LensMake,
      model: exif.LensModel ?? exif.Lens
    }),
    settings: compactObject({
      focalLength: exif.FocalLength,
      focalLength35mm: exif.FocalLengthIn35mmFormat,
      iso: numericValue(exif.ISO),
      aperture: apertureValue(exif.FNumber ?? exif.Aperture),
      shutterSpeed: exif.ShutterSpeed ?? exif.ExposureTime,
      exposureCompensation: exif.ExposureCompensation,
      exposureProgram: exif.ExposureProgram,
      meteringMode: exif.MeteringMode,
      whiteBalance: exif.WhiteBalance,
      flash: exif.Flash
    }),
    capturedDate: captureDate(exif.DateTimeOriginal),
    capturedMonth: captureMonth(exif.DateTimeOriginal)
  }
  const publicMetadata = {
    source: relativeInput,
    format: 'avif',
    width: convertedMetadata.width,
    height: convertedMetadata.height,
    sha256,
    photography
  }

  await writeFile(
    metadataFile,
    `${JSON.stringify(metadata, jsonReplacer, 2)}\n`
  )
  await writeFile(
    publicMetadataFile,
    `${JSON.stringify(publicMetadata, jsonReplacer, 2)}\n`
  )

  const avifKey = `${prefix}/${relativeStem}.${fingerprint}.avif`
  const metadataKey = `${prefix}/metadata/${relativeInput}.json`
  if (shouldUpload) {
    upload(outputFile, avifKey, 'image/avif')
    if (shouldUploadMetadata)
      upload(publicMetadataFile, metadataKey, 'application/json')
  }

  manifest.assets.push({
    source: relativeInput,
    avif: toPosix(relative(outputDir, outputFile)),
    metadata: toPosix(relative(outputDir, metadataFile)),
    publicMetadata: toPosix(relative(outputDir, publicMetadataFile)),
    avifKey,
    metadataKey,
    originalBytes: originalStat.byteLength,
    avifBytes: convertedStat.byteLength,
    savedBytes: originalStat.byteLength - convertedStat.byteLength,
    savedPercent: Number(
      percentSaved(originalStat.byteLength, convertedStat.byteLength).toFixed(1)
    ),
    sha256,
    fingerprint,
    width: convertedMetadata.width,
    height: convertedMetadata.height,
    exifKeys,
    privacyFlags: metadata.privacyFlags
  })
}

await writeFile(
  resolve(outputDir, 'manifest.json'),
  `${JSON.stringify(manifest, jsonReplacer, 2)}\n`
)

const totals = manifest.assets.reduce(
  (result, asset) => ({
    originalBytes: result.originalBytes + asset.originalBytes,
    avifBytes: result.avifBytes + asset.avifBytes
  }),
  { originalBytes: 0, avifBytes: 0 }
)

console.log(
  `Prepared ${manifest.assets.length} images at AVIF quality ${quality}.`
)
console.log(`Original total: ${bytesToMiB(totals.originalBytes)}`)
console.log(`AVIF total:    ${bytesToMiB(totals.avifBytes)}`)
console.log(
  `Saved:         ${bytesToMiB(totals.originalBytes - totals.avifBytes)} (${percentSaved(totals.originalBytes, totals.avifBytes).toFixed(1)}%)`
)
console.log(`Preview output: ${outputDir}`)
console.log(
  shouldUpload
    ? `Uploaded AVIFs to R2 bucket ${bucket}. ${shouldUploadMetadata ? 'Uploaded safe public metadata too; full EXIF stayed local.' : 'Full EXIF sidecars stayed local.'}`
    : 'Upload skipped. Pass --upload only after reviewing manifest.json and EXIF privacy flags.'
)

await exiftool.end()
