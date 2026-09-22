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

/** Homepage colours sampled from Porter Robinson's Nurture artwork. */
export const homeTheme: PageTheme = {
  text: 'hsl(0 0% 96% / 1)',
  background: 'hsl(120deg 39.64% 23.28% / 1)',
  highlight: 'hsl(72.1deg 41.81% 75.48% / 1)',
  textHighlight: 'hsl(72.1deg 41.81% 75.48% / 1)',
  textHighlightText: 'hsl(120deg 39.64% 23.28% / 1)',
  muted: 'hsl(120 25% 94% / 0.74)',
  border: 'hsl(0 0% 96% / 0.3)'
}

/** A quiet neutral-paper palette shared by the primary text pages. */
export const projectsTheme: PageTheme = {
  text: 'hsl(150 10% 17% / 1)',
  background: 'hsl(72 18% 93% / 1)',
  highlight: 'hsl(0deg 0% 38.19%)',
  textHighlight: 'hsl(0deg 0% 38.19%)',
  textHighlightText: 'hsl(72 18% 98% / 1)',
  muted: 'hsl(150 8% 32% / 0.64)',
  border: 'hsl(150 10% 17% / 0.18)'
}

/** A restrained warm-paper palette for writing. */
export const writingTheme: PageTheme = {
  text: '#2b2723',
  background: '#e8ded1',
  highlight: '#7a493d',
  textHighlight: '#7a493d',
  textHighlightText: '#f8f2ea',
  muted: 'rgba(43, 39, 35, 0.6)',
  border: 'rgba(43, 39, 35, 0.2)'
}

/** A soft rose palette for the curated route. */
export const curatedTheme: PageTheme = {
  text: '#2b1f24',
  background: '#ead8d9',
  highlight: '#8d3f52',
  textHighlight: '#8d3f52',
  textHighlightText: '#ffffff',
  muted: 'rgba(43, 31, 36, 0.62)',
  border: 'rgba(43, 31, 36, 0.22)'
}

/** A neutral fallback for missing pages. */
export const notFoundTheme: PageTheme = {
  text: '#20252b',
  background: '#dfe4e8',
  highlight: '#345d75',
  textHighlight: '#345d75',
  textHighlightText: '#ffffff',
  muted: 'rgba(32, 37, 43, 0.62)',
  border: 'rgba(32, 37, 43, 0.22)'
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
  '/': { ...projectsTheme },
  '/art': { ...artTheme },
  '/curated': { ...curatedTheme },
  '/playlists': { ...playlistsTheme },
  '/projects': { ...projectsTheme },
  '/writing': { ...projectsTheme },
  '/404': { ...notFoundTheme }
}

/** Always-available fallback for unknown, empty, or malformed paths. */
export const defaultPageTheme: PageTheme = { ...homeTheme }

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
 * `/writing/my-entry` inherits `/writing` while unknown paths use the home
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
