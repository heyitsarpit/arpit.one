import type { NextApiRequest, NextApiResponse } from 'next'

import {
  createOAuthState,
  getSpotifyClientId,
  getSpotifyRedirectUri,
  isSecureRequest,
  serializeCookie,
  spotifyScopes
} from '@/utils/spotify'

const Login = (_req: NextApiRequest, res: NextApiResponse) => {
  const clientId = getSpotifyClientId()
  const redirectUri = getSpotifyRedirectUri()

  if (!clientId || !redirectUri) {
    res.status(503).json({
      error: 'Spotify OAuth is not configured on this environment.'
    })
    return
  }

  const state = createOAuthState()
  const secure = isSecureRequest(_req)

  res.setHeader('Cache-Control', 'no-store')
  res.setHeader(
    'Set-Cookie',
    serializeCookie('spotify_oauth_state', state, { maxAge: 600, secure })
  )

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: spotifyScopes,
    state
  })

  res.redirect(
    302,
    `https://accounts.spotify.com/authorize?${params.toString()}`
  )
}

export default Login
