import type { NextApiRequest, NextApiResponse } from 'next'

import {
  getQueryValue,
  getSpotifyAccessToken,
  getSpotifyConfigError
} from '@/utils/spotify'

const timeRanges = ['short_term', 'medium_term', 'long_term'] as const
type TimeRange = (typeof timeRanges)[number]

type SpotifyArtist = {
  id?: string
  name?: string
  external_urls?: { spotify?: string }
  images?: Array<{ url?: string }>
}

type SpotifyTrack = {
  id?: string
  name?: string
  external_urls?: { spotify?: string }
  artists?: Array<{ name?: string }>
  album?: {
    name?: string
    release_date?: string
    images?: Array<{ url?: string }>
  }
}

const isTimeRange = (value: string | undefined): value is TimeRange =>
  Boolean(value && timeRanges.includes(value as TimeRange))

const Stats = async (req: NextApiRequest, res: NextApiResponse) => {
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

  const requestedRange = getQueryValue(req.query.range)
  const range = isTimeRange(requestedRange) ? requestedRange : 'medium_term'

  const accessToken = await getSpotifyAccessToken()

  if (!accessToken) {
    res.status(502).json({
      configured: true,
      error: 'Spotify access could not be refreshed.'
    })
    return
  }

  const headers = { Authorization: `Bearer ${accessToken}` }
  const query = new URLSearchParams({ time_range: range, limit: '50' })
  const [artistsResponse, tracksResponse] = await Promise.all([
    fetch(`https://api.spotify.com/v1/me/top/artists?${query}`, { headers }),
    fetch(`https://api.spotify.com/v1/me/top/tracks?${query}`, { headers })
  ])

  if (artistsResponse.status === 403 || tracksResponse.status === 403) {
    res.status(403).json({
      configured: true,
      error:
        'Spotify top items need one reauthorization with the user-top-read permission.'
    })
    return
  }

  if (artistsResponse.status === 429 || tracksResponse.status === 429) {
    const retryAfter =
      artistsResponse.headers.get('retry-after') ||
      tracksResponse.headers.get('retry-after')
    if (retryAfter) res.setHeader('Retry-After', retryAfter)
    res
      .status(429)
      .json({ configured: true, error: 'Spotify rate limit reached.' })
    return
  }

  if (!artistsResponse.ok || !tracksResponse.ok) {
    res.status(502).json({
      configured: true,
      error: 'Spotify listening stats could not be loaded.'
    })
    return
  }

  const [artistsPayload, tracksPayload] = (await Promise.all([
    artistsResponse.json(),
    tracksResponse.json()
  ])) as [{ items?: SpotifyArtist[] }, { items?: SpotifyTrack[] }]

  res.setHeader(
    'Cache-Control',
    'public, s-maxage=300, stale-while-revalidate=900'
  )
  res.status(200).json({
    configured: true,
    range,
    artists: (artistsPayload.items || []).map((artist) => ({
      id: artist.id || '',
      name: artist.name || 'Unknown artist',
      image: artist.images?.[0]?.url || '',
      url: artist.external_urls?.spotify || ''
    })),
    tracks: (tracksPayload.items || []).map((track) => ({
      id: track.id || '',
      name: track.name || 'Untitled track',
      artists: track.artists?.map(({ name }) => name).filter(Boolean) || [],
      album: track.album?.name || '',
      releaseYear: track.album?.release_date?.slice(0, 4) || '',
      image: track.album?.images?.[0]?.url || '',
      url: track.external_urls?.spotify || ''
    }))
  })
}

export default Stats
