import type { NextApiRequest, NextApiResponse } from 'next'

import {
  getSpotifyClientId,
  getSpotifyConfigError,
  getSpotifyRefreshToken,
  rememberSpotifyRefreshToken,
  spotifyBasicAuth
} from '@/utils/spotify'

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
  next?: string | null
}

const Albums = async (req: NextApiRequest, res: NextApiResponse) => {
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

  const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: spotifyBasicAuth(),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: getSpotifyRefreshToken(),
      client_id: getSpotifyClientId()
    })
  })

  if (!tokenResponse.ok) {
    res.status(502).json({
      configured: true,
      error: 'Spotify access could not be refreshed.'
    })
    return
  }

  const tokenPayload = (await tokenResponse.json()) as {
    access_token?: string
    refresh_token?: string
  }

  if (tokenPayload.refresh_token) {
    rememberSpotifyRefreshToken(tokenPayload.refresh_token)
  }

  if (!tokenPayload.access_token) {
    res.status(502).json({
      configured: true,
      error: 'Spotify returned no access token.'
    })
    return
  }

  const headers = { Authorization: `Bearer ${tokenPayload.access_token}` }
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
  let nextUrl: string | null =
    'https://api.spotify.com/v1/me/albums?limit=50&offset=0'

  while (nextUrl) {
    const albumsResponse = await fetch(nextUrl, { headers })

    if (albumsResponse.status === 403) {
      res.status(403).json({
        configured: true,
        error:
          'Saved albums need one reauthorization with the user-library-read permission.'
      })
      return
    }

    if (albumsResponse.status === 429) {
      const retryAfter = albumsResponse.headers.get('retry-after')
      if (retryAfter) res.setHeader('Retry-After', retryAfter)
      res.status(429).json({
        configured: true,
        error: 'Spotify rate limit reached. Try again shortly.'
      })
      return
    }

    if (!albumsResponse.ok) {
      res.status(502).json({
        configured: true,
        error: 'Saved Spotify albums could not be loaded.'
      })
      return
    }

    const albumsPayload =
      (await albumsResponse.json()) as SpotifySavedAlbumsPayload

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

    nextUrl = albumsPayload.next || null
  }

  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=900')
  res.status(200).json({ configured: true, albums })
}

export default Albums
