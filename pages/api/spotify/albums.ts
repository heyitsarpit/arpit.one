import type { NextApiRequest, NextApiResponse } from 'next'

import { getSpotifyAccessToken, getSpotifyConfigError } from '@/utils/spotify'

type SpotifyAlbum = {
  id?: string
  name?: string
  artists?: Array<{ name?: string }>
  external_urls?: { spotify?: string }
  images?: Array<{ url?: string }>
  release_date?: string
  total_tracks?: number
}

type SpotifySavedAlbum = {
  added_at?: string
  album?: SpotifyAlbum
}

type SpotifySavedAlbumsPayload = {
  items?: SpotifySavedAlbum[]
  limit?: number
  next?: string | null
  total?: number
}

type AlbumsPage = {
  payload: SpotifySavedAlbumsPayload | null
  response: Response
}

const fetchAlbumsPage = async (
  url: string,
  headers: HeadersInit
): Promise<AlbumsPage> => {
  const response = await fetch(url, { headers })
  const payload = response.ok
    ? ((await response.json()) as SpotifySavedAlbumsPayload)
    : null

  return { payload, response }
}

const Albums = async (req: NextApiRequest, res: NextApiResponse) => {
  // Never let a transient Spotify or deployment failure linger in an edge cache.
  // The successful response below replaces this with its public cache policy.
  res.setHeader('Cache-Control', 'private, no-store')

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    res.status(405).json({ error: 'Method not allowed.' })
    return
  }

  const missing = getSpotifyConfigError()
  if (missing) {
    res.status(503).json({
      configured: false,
      missing: missing.filter((name) => name !== 'SPOTIFY_CLIENT_SECRET')
    })
    return
  }

  const accessToken = await getSpotifyAccessToken()

  if (!accessToken) {
    res.status(502).json({
      configured: true,
      error: 'Spotify access could not be refreshed.'
    })
    return
  }

  const headers = { Authorization: `Bearer ${accessToken}` }
  const albums: Array<{
    id: string
    name: string
    artists: string[]
    image: string
    releaseYear: string
    totalTracks: number
    url: string
    addedAt: string
  }> = []
  const firstPage = await fetchAlbumsPage(
    'https://api.spotify.com/v1/me/albums?limit=50&offset=0',
    headers
  )

  const handlePageError = (albumsResponse: Response) => {
    if (albumsResponse.status === 403) {
      res.status(403).json({
        configured: true,
        error:
          'Saved albums need one reauthorization with the user-library-read permission.'
      })
      return true
    }

    if (albumsResponse.status === 429) {
      const retryAfter = albumsResponse.headers.get('retry-after')
      if (retryAfter) res.setHeader('Retry-After', retryAfter)
      res.status(429).json({
        configured: true,
        error: 'Spotify rate limit reached. Try again shortly.'
      })
      return true
    }

    if (!albumsResponse.ok) {
      res.status(502).json({
        configured: true,
        error: 'Saved Spotify albums could not be loaded.'
      })
      return true
    }

    return false
  }

  if (handlePageError(firstPage.response) || !firstPage.payload) return

  const firstPayload = firstPage.payload
  const limit = firstPayload.limit || 50
  const total = firstPayload.total || 0
  const pages: SpotifySavedAlbumsPayload[] = [firstPayload]

  if (total > 0) {
    const pageUrls = Array.from(
      { length: Math.max(0, Math.ceil(total / limit) - 1) },
      (_, index) =>
        `https://api.spotify.com/v1/me/albums?limit=${limit}&offset=${(index + 1) * limit}`
    )

    for (let index = 0; index < pageUrls.length; index += 4) {
      const pageResults = await Promise.all(
        pageUrls
          .slice(index, index + 4)
          .map((url) => fetchAlbumsPage(url, headers))
      )

      for (const page of pageResults) {
        if (handlePageError(page.response) || !page.payload) return
        pages.push(page.payload)
      }
    }
  } else {
    let nextUrl = firstPayload.next || null

    while (nextUrl) {
      const page = await fetchAlbumsPage(nextUrl, headers)
      if (handlePageError(page.response) || !page.payload) return
      pages.push(page.payload)
      nextUrl = page.payload.next || null
    }
  }

  for (const albumsPayload of pages) {
    for (const item of albumsPayload.items || []) {
      const album = item.album
      if (!album) continue

      albums.push({
        id: album.id || `${album.name || 'album'}-${albums.length}`,
        name: album.name || 'Untitled album',
        artists:
          album.artists
            ?.map(({ name }) => name)
            .filter((name): name is string => Boolean(name)) || [],
        image: album.images?.[0]?.url || '',
        releaseYear: album.release_date?.slice(0, 4) || '',
        totalTracks: album.total_tracks || 0,
        url: album.external_urls?.spotify || '',
        addedAt: item.added_at || ''
      })
    }
  }

  res.setHeader(
    'Cache-Control',
    'public, s-maxage=300, stale-while-revalidate=900'
  )
  res.status(200).json({ configured: true, albums })
}

export default Albums
