import { randomBytes } from 'node:crypto'
import type { NextApiRequest } from 'next'

export const spotifyScopes = [
  'user-read-recently-played',
  'user-top-read',
  'user-library-read',
  'user-read-private',
  'playlist-read-private',
  'playlist-read-collaborative'
].join(' ')

const base64PaddingPattern = /=+$/

export const getSpotifyClientId = () => process.env.SPOTIFY_CLIENT_ID || ''

export const getSpotifyClientSecret = () =>
  process.env.SPOTIFY_CLIENT_SECRET || ''

export const getSpotifyRedirectUri = () =>
  process.env.SPOTIFY_REDIRECT_URI || ''

let runtimeRefreshToken = ''
let runtimeAccessToken: {
  value: string
  expiresAt: number
} | null = null
let accessTokenRequest: Promise<string | null> | null = null

export const getSpotifyRefreshToken = () =>
  runtimeRefreshToken || process.env.SPOTIFY_REFRESH_TOKEN || ''

export const rememberSpotifyRefreshToken = (refreshToken: string) => {
  runtimeRefreshToken = refreshToken
}

export const getSpotifyAccessToken = async (): Promise<string | null> => {
  if (runtimeAccessToken && runtimeAccessToken.expiresAt > Date.now()) {
    return runtimeAccessToken.value
  }

  if (accessTokenRequest) return accessTokenRequest

  const request = (async () => {
    try {
      const tokenResponse = await fetch(
        'https://accounts.spotify.com/api/token',
        {
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
        }
      )

      if (!tokenResponse.ok) return null

      const tokenPayload = (await tokenResponse.json()) as {
        access_token?: string
        expires_in?: number
        refresh_token?: string
      }

      if (tokenPayload.refresh_token) {
        rememberSpotifyRefreshToken(tokenPayload.refresh_token)
      }

      if (!tokenPayload.access_token) return null

      const expiresInMs = Number.isFinite(tokenPayload.expires_in)
        ? Math.max(30_000, Number(tokenPayload.expires_in) * 1000)
        : 60 * 60 * 1000
      const refreshSafetyWindow = Math.min(60_000, expiresInMs / 10)

      runtimeAccessToken = {
        value: tokenPayload.access_token,
        expiresAt: Date.now() + expiresInMs - refreshSafetyWindow
      }

      return tokenPayload.access_token
    } catch {
      return null
    }
  })()

  accessTokenRequest = request

  try {
    return await request
  } finally {
    if (accessTokenRequest === request) accessTokenRequest = null
  }
}

export const getSpotifyConfigError = () => {
  const missing = [
    ['SPOTIFY_CLIENT_ID', getSpotifyClientId()],
    ['SPOTIFY_CLIENT_SECRET', getSpotifyClientSecret()],
    ['SPOTIFY_REDIRECT_URI', getSpotifyRedirectUri()],
    ['SPOTIFY_REFRESH_TOKEN', getSpotifyRefreshToken()]
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name)

  return missing.length > 0 ? missing : null
}

export const isSecureRequest = (
  request: Pick<NextApiRequest, 'headers' | 'socket'>
) => {
  const forwardedProtocol = request.headers['x-forwarded-proto']
  const protocol = Array.isArray(forwardedProtocol)
    ? forwardedProtocol[0]
    : forwardedProtocol?.split(',')[0].trim()

  return (
    protocol === 'https' ||
    Boolean(
      (request.socket as typeof request.socket & { encrypted?: boolean })
        .encrypted
    )
  )
}

export const createOAuthState = () =>
  randomBytes(32)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(base64PaddingPattern, '')

export const parseCookies = (header: string | undefined) =>
  Object.fromEntries(
    (header || '').split(';').flatMap((part) => {
      const separator = part.indexOf('=')
      if (separator < 0) return []

      const key = part.slice(0, separator).trim()
      const value = part.slice(separator + 1).trim()
      return [[key, decodeURIComponent(value)]]
    })
  ) as Record<string, string>

export const serializeCookie = (
  name: string,
  value: string,
  options: { maxAge?: number; secure?: boolean } = {}
) => {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/api/spotify',
    'HttpOnly',
    'SameSite=Lax'
  ]

  if (typeof options.maxAge === 'number')
    parts.push(`Max-Age=${options.maxAge}`)
  if (options.secure) parts.push('Secure')

  return parts.join('; ')
}

export const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

export const getQueryValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value

export const spotifyBasicAuth = () =>
  `Basic ${Buffer.from(
    `${getSpotifyClientId()}:${getSpotifyClientSecret()}`
  ).toString('base64')}`
