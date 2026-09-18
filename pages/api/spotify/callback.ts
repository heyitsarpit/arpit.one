import type { NextApiRequest, NextApiResponse } from 'next'

import {
  escapeHtml,
  getQueryValue,
  getSpotifyRedirectUri,
  isSecureRequest,
  parseCookies,
  rememberSpotifyRefreshToken,
  serializeCookie,
  spotifyBasicAuth
} from '@/utils/spotify'

const clearOAuthCookies = (secure: boolean) => [
  serializeCookie('spotify_oauth_state', '', { maxAge: 0, secure })
]

const tokenPage = (refreshToken: string) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="robots" content="noindex, nofollow" />
    <meta name="referrer" content="no-referrer" />
    <title>Spotify connected</title>
    <style>
      body { margin: 40px; max-width: 760px; font: 16px/1.6 system-ui, sans-serif; }
      code { display: block; padding: 16px; overflow-wrap: anywhere; background: #eee; }
    </style>
  </head>
  <body>
    <h1>Spotify connected</h1>
    <p>Copy this line into your local <code>.env.local</code>, restart Next.js, then reload <a href="/playlists">/playlists</a>.</p>
    <code>SPOTIFY_REFRESH_TOKEN=${escapeHtml(refreshToken)}</code>
    <p>Do not commit or share this token.</p>
  </body>
</html>`

const Callback = async (req: NextApiRequest, res: NextApiResponse) => {
  const code = getQueryValue(req.query.code)
  const state = getQueryValue(req.query.state)
  const error = getQueryValue(req.query.error)
  const cookies = parseCookies(req.headers.cookie)
  const secure = isSecureRequest(req)

  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('Referrer-Policy', 'no-referrer')
  res.setHeader('Set-Cookie', clearOAuthCookies(secure))

  if (error) {
    res
      .status(400)
      .send(`Spotify authorization was denied: ${escapeHtml(error)}`)
    return
  }

  if (
    !code ||
    !state ||
    !cookies.spotify_oauth_state ||
    state !== cookies.spotify_oauth_state
  ) {
    res.status(400).send('Spotify authorization could not be verified.')
    return
  }

  const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: spotifyBasicAuth(),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: getSpotifyRedirectUri()
    })
  })

  if (!tokenResponse.ok) {
    res.status(502).send('Spotify did not accept the authorization response.')
    return
  }

  const tokenPayload = (await tokenResponse.json()) as {
    refresh_token?: string
  }
  const refreshToken = tokenPayload.refresh_token

  if (!refreshToken) {
    res.status(502).send('Spotify did not return a refresh token.')
    return
  }

  rememberSpotifyRefreshToken(refreshToken)

  const isLocalBootstrap =
    getSpotifyRedirectUri().startsWith('http://127.0.0.1:')

  if (isLocalBootstrap) {
    res.status(200)
    res.setHeader('Content-Type', 'text/html')
    res.send(tokenPage(refreshToken))
    return
  }

  if (!process.env.SPOTIFY_REFRESH_TOKEN) {
    res
      .status(503)
      .send(
        'Spotify authorization succeeded, but this production environment is missing SPOTIFY_REFRESH_TOKEN. Generate it locally, then add it to the production environment settings.'
      )
    return
  }

  res.redirect(302, '/playlists?spotify=connected')
}

export default Callback
