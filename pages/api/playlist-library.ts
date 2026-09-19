import fs from 'node:fs'
import path from 'node:path'
import type { NextApiRequest, NextApiResponse } from 'next'

const PlaylistLibrary = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    res.status(405).json({ error: 'Method not allowed.' })
    return
  }

  const file = path.resolve(process.cwd(), 'data', 'spotify-playlists.json')
  const library = JSON.parse(fs.readFileSync(file, 'utf-8'))

  res.setHeader(
    'Cache-Control',
    'public, s-maxage=300, stale-while-revalidate=900'
  )
  res.status(200).json(library)
}

export default PlaylistLibrary
