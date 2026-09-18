import fs from 'node:fs/promises'
import path from 'node:path'

const apiBase = 'https://api.spotify.com/v1'
const tokenUrl = 'https://accounts.spotify.com/api/token'
const outputPath = path.resolve(process.cwd(), 'data/spotify-playlists.json')
const ignorePath = path.resolve(
  process.cwd(),
  'data/spotify-playlists-ignore.json'
)

const requiredEnvironment = [
  'SPOTIFY_CLIENT_ID',
  'SPOTIFY_CLIENT_SECRET',
  'SPOTIFY_REFRESH_TOKEN'
]

const missing = requiredEnvironment.filter((name) => !process.env[name])
if (missing.length > 0) {
  throw new Error(
    `Missing Spotify environment variables: ${missing.join(', ')}`
  )
}

const spotifyFetch = async (url, options = {}) => {
  const response = await fetch(url, options)

  if (response.status === 429) {
    const retryAfter = response.headers.get('retry-after') || 'a short while'
    throw new Error(`Spotify rate limit reached. Retry after ${retryAfter}.`)
  }

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Spotify request failed (${response.status}): ${body}`)
  }

  return response.json()
}

const tokenPayload = await spotifyFetch(tokenUrl, {
  method: 'POST',
  headers: {
    Authorization: `Basic ${Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString('base64')}`,
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: process.env.SPOTIFY_REFRESH_TOKEN
  })
})

const accessToken = tokenPayload.access_token
if (!accessToken) throw new Error('Spotify returned no access token.')

const authHeaders = { Authorization: `Bearer ${accessToken}` }
const profile = await spotifyFetch(`${apiBase}/me`, { headers: authHeaders })
const ignoreConfig = JSON.parse(await fs.readFile(ignorePath, 'utf8'))
const ignoredPlaylistNames = new Set(ignoreConfig.names || [])

const getAllPages = async (url) => {
  const values = []
  let nextUrl = url

  while (nextUrl) {
    const page = await spotifyFetch(nextUrl, { headers: authHeaders })
    values.push(...(page.items || []))
    nextUrl = page.next
  }

  return values
}

const allPlaylists = await getAllPages(
  `${apiBase}/me/playlists?limit=50&offset=0`
)
const ownedPlaylists = allPlaylists.filter(
  (playlist) => playlist.owner?.id === profile.id
)
const visiblePlaylists = ownedPlaylists.filter(
  (playlist) => !ignoredPlaylistNames.has(playlist.name)
)

const playlists = []
for (const playlist of visiblePlaylists) {
  const items = await getAllPages(
    `${apiBase}/playlists/${playlist.id}/items?limit=50&offset=0`
  )
  const tracks = items.flatMap((entry) => {
    const track = entry.item || entry.track
    if (!track || track.type !== 'track') return []

    return [
      {
        id: track.id,
        name: track.name || 'Untitled track',
        artists: (track.artists || []).map((artist) => artist.name),
        album: track.album?.name || 'Unknown album',
        albumImage: track.album?.images?.[0]?.url || '',
        url: track.external_urls?.spotify || ''
      }
    ]
  })

  playlists.push({
    id: playlist.id,
    name: playlist.name || 'Untitled playlist',
    description: playlist.description || '',
    image: playlist.images?.[0]?.url || '',
    url: playlist.external_urls?.spotify || '',
    tracks
  })
}

const library = {
  generatedAt: new Date().toISOString(),
  owner: {
    id: profile.id || '',
    displayName: profile.display_name || ''
  },
  playlists
}

await fs.mkdir(path.dirname(outputPath), { recursive: true })
await fs.writeFile(outputPath, `${JSON.stringify(library, null, 2)}\n`)

console.log(
  `Stored ${playlists.length} owned playlists (${ownedPlaylists.length - visiblePlaylists.length} ignored) and ${playlists.reduce(
    (total, playlist) => total + playlist.tracks.length,
    0
  )} tracks in ${path.relative(process.cwd(), outputPath)}.`
)
