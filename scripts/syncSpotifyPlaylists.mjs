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

const spotifyFetch = async (url, options = {}, attempt = 0) => {
  const response = await fetch(url, options)

  if (response.status === 429) {
    const retryAfter = Number.parseInt(
      response.headers.get('retry-after') || '',
      10
    )
    if (attempt < 2 && Number.isFinite(retryAfter)) {
      await new Promise((resolve) =>
        setTimeout(resolve, (retryAfter + 1) * 1000)
      )
      return spotifyFetch(url, options, attempt + 1)
    }
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

const getArtistImages = async (artistIds) => {
  const images = new Map()

  for (let index = 0; index < artistIds.length; index += 4) {
    const ids = artistIds.slice(index, index + 4)
    const artists = await Promise.all(
      ids.map((artistId) =>
        spotifyFetch(`${apiBase}/artists/${artistId}`, {
          headers: authHeaders
        })
      )
    )

    for (const artist of artists) {
      const image = artist.images?.[0]?.url
      if (artist.id && image) images.set(artist.id, image)
    }
  }

  return images
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
        artistIds: (track.artists || []).map((artist) => artist.id),
        artistUrls: (track.artists || []).map(
          (artist) => artist.external_urls?.spotify || ''
        ),
        album: track.album?.name || 'Unknown album',
        releaseYear: track.album?.release_date?.slice(0, 4) || '',
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

const artistCounts = new Map()
for (const playlist of playlists) {
  for (const track of playlist.tracks) {
    for (const artistId of track.artistIds) {
      if (artistId)
        artistCounts.set(artistId, (artistCounts.get(artistId) || 0) + 1)
    }
  }
}
const artistIds = [...artistCounts.entries()]
  .sort(([, left], [, right]) => right - left)
  .slice(0, 10)
  .map(([artistId]) => artistId)
const artistImages = await getArtistImages(artistIds)

for (const playlist of playlists) {
  playlist.tracks = playlist.tracks.map((track) => {
    const { artistIds: trackArtistIds, ...storedTrack } = track
    return {
      ...storedTrack,
      artistImages: trackArtistIds.map(
        (artistId) => artistImages.get(artistId) || ''
      )
    }
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
