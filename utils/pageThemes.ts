/**
 * The colour contract consumed by the page shell.
 *
 * Keep route-specific values in `pageThemes` below so each page can be
 * customised without changing the rest of the application.
 */
export type PageTheme = {
  text: string
  background: string
  highlight: string
  textHighlight: string
  textHighlightText: string
  muted: string
  border: string
}

export type PageThemeConfig = Record<string, PageTheme>

/** Molly's home palette from https://www.molly.info/. */
export const mollyHomeTheme: PageTheme = {
  text: '#000000',
  background: '#bac8d3',
  highlight: '#0c6e99',
  textHighlight: '#0c6e99',
  textHighlightText: '#ffffff',
  muted: 'rgba(0, 0, 0, 0.62)',
  border: 'rgba(0, 0, 0, 0.22)'
}

/** A warm companion palette for pages that need a different visual mood. */
export const warmTheme: PageTheme = {
  text: '#000000',
  background: '#ffdc9c',
  highlight: '#d6893a',
  textHighlight: '#d6893a',
  textHighlightText: '#000000',
  muted: 'rgba(34, 34, 34, 0.62)',
  border: 'rgba(34, 34, 34, 0.24)'
}

export const artTheme: PageTheme = {
  text: '#ffffff',
  background: '#000000',
  highlight: '#ffffff',
  textHighlight: '#ffffff',
  textHighlightText: '#000000',
  muted: 'rgba(255, 255, 255, 0.62)',
  border: 'rgba(255, 255, 255, 0.28)'
}

export const playlistsTheme: PageTheme = {
  text: '#2f2924',
  background: '#fbf8f1',
  highlight: '#9a6a56',
  textHighlight: '#9a6a56',
  textHighlightText: '#ffffff',
  muted: 'rgba(47, 41, 36, 0.62)',
  border: 'rgba(47, 41, 36, 0.2)'
}

/**
 * Edit the values for an individual route here. Nested routes inherit the
 * nearest configured parent route unless they have their own entry.
 */
export const pageThemes: PageThemeConfig = {
  '/': { ...mollyHomeTheme },
  '/art': { ...artTheme },
  '/curated': { ...warmTheme },
  '/playlists': { ...playlistsTheme },
  '/posts': { ...warmTheme },
  '/404': { ...warmTheme }
}

/** Always-available fallback for unknown, empty, or malformed paths. */
export const defaultPageTheme: PageTheme = { ...mollyHomeTheme }

const urlProtocolPattern = /^[a-z][a-z\d+.-]*:\/\//i
const queryPattern = /[?#]/
const trailingSlashPattern = /\/+$/

const normalizePathname = (pathname: string | null | undefined): string => {
  if (!pathname) return '/'

  const value = pathname.trim()
  if (!value) return '/'

  let path = value

  // Accept a URL as a convenience while keeping pathname-only inputs fast.
  if (urlProtocolPattern.test(value)) {
    try {
      path = new URL(value).pathname
    } catch {
      return '/'
    }
  }

  path = path.split(queryPattern, 1)[0]
  if (!path.startsWith('/')) path = `/${path}`
  if (path.length > 1) path = path.replace(trailingSlashPattern, '')

  return path || '/'
}

/**
 * Resolve the theme for a pathname.
 *
 * Exact entries win, then the longest matching parent route wins. This makes
 * `/posts/my-entry` inherit `/posts` while unknown paths safely use the home
 * palette.
 */
export const resolvePageTheme = (
  pathname: string | null | undefined
): PageTheme => {
  const path = normalizePathname(pathname)
  const exactTheme = pageThemes[path]
  if (exactTheme) return exactTheme

  const parentRoute = Object.keys(pageThemes)
    .filter(
      (route) =>
        route !== '/' && (path === route || path.startsWith(`${route}/`))
    )
    .sort((a, b) => b.length - a.length)[0]

  return pageThemes[parentRoute] ?? defaultPageTheme
}
