import fs from 'node:fs/promises'
import { join } from 'node:path'

import sharp from 'sharp'
import glob from 'tiny-glob'

const RootDir = '.'
const assetBaseUrl = (
  process.env.ART_ASSET_BASE_URL ?? 'https://assets.arpit.one'
).replace(/\/$/, '')

const videoPosterOverrides: Record<string, string> = {
  '2017-12-10_17-50-19_UTC.jpg': '2020-04-23_13-38-29_UTC.mp4',
  '2018-07-21_15-09-51_UTC.jpg': '2018-09-21_06-47-38_UTC.mp4',
  '2018-09-21_06-47-38_UTC.jpg': '2018-07-21_15-09-51_UTC.mp4',
  '2020-04-23_13-38-29_UTC.jpg': '2017-12-10_17-50-19_UTC.mp4'
}

const videoRatioOverrides: Record<string, number> = {
  '2018-01-30_05-04-40_UTC.jpg': 1,
  '2018-02-10_09-16-27_UTC.jpg': 1,
  '2018-09-21_06-47-38_UTC.jpg': 1
}

async function buildArt() {
  const files = await glob('*', { cwd: `${RootDir}/public/art/` })
  const images: Array<{ file: string; width: number; height: number }> = []
  const videoPosters: string[] = []

  for (const file of files) {
    const [name, extension] = file.split('.')

    if (extension === 'jpg') {
      if (files.includes(`${name}.mp4`)) videoPosters.push(file)
      else {
        const metadata = await sharp(
          join(RootDir, 'public/art', file)
        ).metadata()
        if (!metadata.width || !metadata.height)
          throw new Error(`Missing dimensions for ${file}`)
        images.push({ file, width: metadata.width, height: metadata.height })
      }
    }
  }

  images.sort((first, second) => second.file.localeCompare(first.file))
  const exports = ['// This is a generated file\n\n']
  const imageEntries = images.map(
    ({ file, width, height }) =>
      `{ src: '${assetBaseUrl}/art/${file}', width: ${width}, height: ${height} }`
  )

  const videoEntries = videoPosters
    .map((poster) => ({
      poster,
      ratio: videoRatioOverrides[poster] ?? 16 / 9,
      source: videoPosterOverrides[poster] ?? poster.replace('.jpg', '.mp4')
    }))
    .sort((first, second) => first.source.localeCompare(second.source))
  const videoPaths = videoEntries.map(
    ({ poster, ratio, source }) =>
      `["/art/${source}", "/art/${poster}", ${ratio}]`
  )

  exports.push(
    `\nexport type ArtImage = { src: string; width: number; height: number }\n\nexport const images: ArtImage[] = [${imageEntries.toString()}]\n`
  )
  exports.push(
    `\nexport const videos: Array<[string, string, number]> = [${videoPaths
      .map((path) => path.replaceAll('"/art/', `"${assetBaseUrl}/art/`))
      .join(',')}];\n`
  )

  await fs.writeFile(join('.', 'utils', 'arts.ts'), exports, 'utf-8')
}

buildArt()
