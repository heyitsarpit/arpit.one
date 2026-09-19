import type { NextApiRequest, NextApiResponse } from 'next'

import { getSpotifyAccessToken, getSpotifyConfigError } from '@/utils/spotify'

type SpotifyRecentItem = {
  played_at?: string
  track?: {
    name?: string
    type?: string
    external_urls?: { spotify?: string }
    artists?: Array<{ name?: string }>
    album?: {
      name?: string
      images?: Array<{ url?: string }>
    }
  }
}

const RecentlyPlayed = async (req: NextApiRequest, res: NextApiResponse) => {
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

  const recentResponse = await fetch(
    'https://api.spotify.com/v1/me/player/recently-played?limit=1',
    {
      headers: { Authorization: `Bearer ${accessToken}` }
    }
  )

  if (recentResponse.status === 429) {
    const retryAfter = recentResponse.headers.get('retry-after')
    if (retryAfter) res.setHeader('Retry-After', retryAfter)
    res
      .status(429)
      .json({ configured: true, error: 'Spotify rate limit reached.' })
    return
  }

  if (!recentResponse.ok) {
    res.status(502).json({
      configured: true,
      error: 'Spotify history could not be loaded.'
    })
    return
  }

  const recentPayload = (await recentResponse.json()) as {
    items?: SpotifyRecentItem[]
  }
  const item = recentPayload.items?.find(({ track }) => track?.type === 'track')

  res.setHeader(
    'Cache-Control',
    'public, s-maxage=60, stale-while-revalidate=300'
  )
  res.status(200).json({
    configured: true,
    track: item?.track
      ? {
          title: item.track.name || 'Untitled track',
          artists:
            item.track.artists?.map(({ name }) => name).filter(Boolean) || [],
          album: item.track.album?.name || '',
          image: item.track.album?.images?.[0]?.url || '',
          url: item.track.external_urls?.spotify || '',
          playedAt: item.played_at || ''
        }
      : null
  })
}

export default RecentlyPlayed
