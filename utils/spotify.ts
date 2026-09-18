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

export const getSpotifyRefreshToken = () =>
  runtimeRefreshToken || process.env.SPOTIFY_REFRESH_TOKEN || ''

export const rememberSpotifyRefreshToken = (refreshToken: string) => {
  runtimeRefreshToken = refreshToken
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
