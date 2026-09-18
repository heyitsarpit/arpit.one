import fs from 'node:fs/promises'
import { join } from 'node:path'

import glob from 'tiny-glob'

const RootDir = '.'

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

function doubleDigit(n: number) {
  return n > 9 ? `${n}` : `0${n}`
}

async function buildArt() {
  const files = await glob('*', { cwd: `${RootDir}/public/art/` })
  const images: string[] = []
  const videos: string[] = []
  const videoPosters: string[] = []

  for (const file of files) {
    const [name, extension] = file.split('.')

    if (extension === 'jpg') {
      files.includes(`${name}.mp4`)
        ? videoPosters.push(file)
        : images.push(file)
    } else if (extension === 'mp4') {
      videos.push(file)
    }
  }

  images.reverse()
  videos.reverse()

  const exports = ['// This is a generated file\n\n']
  let count = 1
  const imgNames: string[] = []
  for (const image of images) {
    const name = `file${doubleDigit(count)}`
    imgNames.push(name)
    exports.push(`import ${name} from '../public/art/${image}';\n`)
    count += 1
  }

  const videoPaths: string[] = []
  for (const poster of videoPosters) {
    videoPaths.push(
      `["/art/${videoPosterOverrides[poster] ?? poster.replace('.jpg', '.mp4')}", "/art/${poster}", ${videoRatioOverrides[poster] ?? 16 / 9}]`
    )
  }

  exports.push(`\nexport const images = [${imgNames.toString()}];\n`)
  exports.push(
    `\nexport const videos: Array<[string, string, number]> = [${videoPaths.toString()}];\n`
  )

  await fs.writeFile(join('.', 'utils', 'arts.ts'), exports, 'utf-8')
}

buildArt()
