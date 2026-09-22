import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'

import {
  focusRingClassName,
  inlineLinkClassName,
  StatusMessage
} from '@/components/SitePrimitives'
import type { StoredPlaylist } from '@/utils/playlists'

type Props = {
  playlists: StoredPlaylist[]
}

type ViewMode = 'cards' | 'table'

type MarqueeTextProps = {
  children: ReactNode
  className?: string
}

const MarqueeText = ({ children, className = '' }: MarqueeTextProps) => {
  const marqueeRef = useRef<HTMLSpanElement>(null)
  const [distance, setDistance] = useState(0)

  useEffect(() => {
    const element = marqueeRef.current
    if (!element) return

    const measure = () => {
      setDistance(Math.max(0, element.scrollWidth - element.clientWidth))
    }

    measure()

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure)
      return () => window.removeEventListener('resize', measure)
    }

    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const style = {
    '--playlist-marquee-distance': `${distance}px`
  } as CSSProperties

  return (
    <span
      ref={marqueeRef}
      className={`group block min-w-0 overflow-hidden whitespace-nowrap ${distance > 1 ? 'group-hover:animate-marquee' : ''} ${className}`}
      style={style}>
      <span className='inline-block min-w-max whitespace-nowrap'>
        {children}
      </span>
    </span>
  )
}

const PlaylistViewIcon = ({ mode }: { mode: ViewMode }) => {
  if (mode === 'cards') {
    return (
      <svg
        className='h-[18px] w-[18px] fill-none stroke-current stroke-[1.25]'
        viewBox='0 0 24 24'
        aria-hidden='true'>
        <rect x='3' y='3' width='8' height='8' rx='1' />
        <rect x='13' y='3' width='8' height='8' rx='1' />
        <rect x='3' y='13' width='8' height='8' rx='1' />
        <rect x='13' y='13' width='8' height='8' rx='1' />
      </svg>
    )
  }

  return (
    <svg
      className='h-[18px] w-[18px] fill-none stroke-current stroke-[1.25]'
      viewBox='0 0 24 24'
      aria-hidden='true'>
      <path d='M4 6h16M4 12h16M4 18h16' />
    </svg>
  )
}

const SpotifyLogoIcon = () => (
  <svg
    className='h-[17px] w-[17px] shrink-0'
    viewBox='0 0 24 24'
    aria-hidden='true'>
    <circle cx='12' cy='12' r='10' fill='currentColor' />
    <path
      d='M7 9.5c3.3-1 6.9-.6 10 .8M7.5 12.5c2.8-.8 5.8-.5 8.5.6M8.5 15.2c2.1-.5 4.3-.2 6.2.5'
      fill='none'
      stroke='var(--page-background)'
      strokeLinecap='round'
      strokeWidth='1.4'
    />
  </svg>
)

const PlaylistExplorer: React.FC<Props> = ({ playlists }) => {
  const router = useRouter()
  const routePlaylistId =
    typeof router.query.playlistId === 'string' ? router.query.playlistId : null
  const [selectedId, setSelectedId] = useState(playlists[0]?.id || '')
  const [viewMode, setViewMode] = useState<ViewMode>('cards')
  const selectedPlaylistHeadingRef = useRef<HTMLHeadingElement>(null)
  const shouldFocusSelectedHeading = useRef(false)
  const handlePlaylistSelect = (id: string) => {
    shouldFocusSelectedHeading.current = true
    setSelectedId(id)
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth'
    })
  }
  const selectedPlaylist = useMemo(
    () =>
      playlists.find(
        (playlist) => playlist.id === (routePlaylistId || selectedId)
      ),
    [playlists, routePlaylistId, selectedId]
  )

  useEffect(() => {
    if (!shouldFocusSelectedHeading.current || !selectedPlaylist) return

    shouldFocusSelectedHeading.current = false
    selectedPlaylistHeadingRef.current?.focus({ preventScroll: true })
  }, [selectedPlaylist])

  if (!selectedPlaylist) {
    return (
      <section className='block min-h-40 p-8'>
        <StatusMessage>
          {playlists.length > 0 ? (
            'Playlist not found.'
          ) : (
            <>
              No stored playlists yet. Run <code>pnpm spotify:sync</code> after
              authorizing playlist access.
            </>
          )}
        </StatusMessage>
      </section>
    )
  }

  return (
    <section
      className='grid min-h-[560px] grid-cols-[280px_minmax(0,1fr)] gap-x-[clamp(32px,5vw,72px)] max-lg:block max-lg:min-h-0'
      aria-label='Playlist explorer'>
      <nav
        className={`sticky top-0 min-w-0 self-start py-8 max-lg:static max-lg:overflow-hidden max-lg:py-5 ${routePlaylistId ? 'max-[700px]:hidden' : ''}`}
        aria-label='Playlists'>
        {!routePlaylistId ? (
          <ul className='m-0 hidden list-none grid-cols-4 gap-x-3 gap-y-5 p-0 max-[700px]:grid'>
            {playlists.map((playlist) => (
              <li className='min-w-0' key={playlist.id}>
                <Link
                  className={`group block min-w-0 text-[color:var(--page-text)] no-underline ${focusRingClassName}`}
                  href={`/playlists/${encodeURIComponent(playlist.id)}`}>
                  {playlist.image ? (
                    <Image
                      src={playlist.image}
                      alt=''
                      className='block aspect-square h-auto w-full rounded-lg bg-[color-mix(in_srgb,var(--page-text)_8%,var(--page-background))] object-cover transition-opacity group-hover:opacity-80'
                      width={320}
                      height={320}
                      sizes='(max-width: 700px) 45vw, 160px'
                      loading='lazy'
                    />
                  ) : (
                    <span className='block aspect-square w-full rounded-lg bg-[color-mix(in_srgb,var(--page-text)_8%,var(--page-background))]' />
                  )}
                  <strong className='mt-2 block overflow-hidden text-ellipsis font-ui text-sm font-normal leading-[1.35]'>
                    {playlist.name}
                  </strong>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
        <ul className='m-0 list-none p-0 max-lg:flex max-lg:max-w-full max-lg:gap-2 max-lg:overflow-x-auto max-[700px]:hidden'>
          {playlists.map((playlist) => {
            const isSelected = playlist.id === selectedPlaylist.id

            return (
              <li key={playlist.id}>
                <button
                  type='button'
                  className={`grid w-full grid-cols-[56px_minmax(0,1fr)] items-center gap-3 rounded-md border-0 bg-transparent p-2 text-left text-[color:var(--page-text)] ${focusRingClassName} hover:bg-[color-mix(in_srgb,var(--page-highlight)_14%,transparent)] max-lg:mb-1 max-lg:min-w-[220px] ${isSelected ? 'bg-[color-mix(in_srgb,var(--page-highlight)_14%,transparent)]' : ''}`}
                  aria-pressed={isSelected}
                  onClick={() => handlePlaylistSelect(playlist.id)}>
                  {playlist.image ? (
                    <Image
                      src={playlist.image}
                      alt=''
                      className='block h-14 w-14 bg-[color-mix(in_srgb,var(--page-text)_12%,transparent)] object-cover'
                      width={56}
                      height={56}
                      sizes='56px'
                      loading='lazy'
                    />
                  ) : (
                    <span className='block aspect-square h-14 w-14 bg-[color-mix(in_srgb,var(--page-text)_12%,transparent)]' />
                  )}
                  <span className='flex min-w-0 flex-col'>
                    <strong className='overflow-hidden text-ellipsis whitespace-nowrap font-ui text-sm font-normal leading-[1.4]'>
                      {playlist.name}
                    </strong>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      <section
        className={`min-w-0 py-8 max-lg:py-7 ${routePlaylistId ? '' : 'max-[700px]:hidden'}`}
        aria-live='polite'>
        {routePlaylistId ? (
          <Link
            className={`mb-7 hidden w-fit font-ui text-sm text-[color:var(--page-muted)] no-underline hover:text-[color:var(--page-text)] max-[700px]:inline-block ${focusRingClassName}`}
            href='/playlists'>
            ← All playlists
          </Link>
        ) : null}
        <header className='mb-8 flex items-start justify-between gap-6 max-lg:block'>
          <div>
            <h2
              className='m-0 font-serif text-[28px] font-normal leading-[1.3] text-[color:var(--page-text)]'
              ref={selectedPlaylistHeadingRef}
              tabIndex={-1}>
              {selectedPlaylist.name}
            </h2>
            {selectedPlaylist.description ? (
              <p className='mt-3 max-w-[520px] font-body text-[17px] leading-[1.5] text-[color:var(--page-muted)]'>
                {selectedPlaylist.description}
              </p>
            ) : null}
            {selectedPlaylist.url ? (
              <a
                className={`mt-4 flex w-fit items-center gap-[7px] font-ui text-[13px] ${inlineLinkClassName}`}
                href={selectedPlaylist.url}
                target='_blank'
                rel='noreferrer'>
                <SpotifyLogoIcon />
                <span>Open in Spotify</span>
                <span aria-hidden='true'>↗</span>
              </a>
            ) : null}
          </div>
          <div className='flex shrink-0 items-center gap-5 max-lg:mt-[18px] max-lg:justify-start max-[479px]:justify-between'>
            <fieldset
              className='flex items-center gap-1 border border-[color:var(--page-border)] bg-[color:var(--page-background)] p-1'
              aria-label='Playlist view'>
              {(['cards', 'table'] as const).map((mode) => (
                <button
                  key={mode}
                  type='button'
                  className={`grid h-9 w-9 place-items-center border border-transparent bg-transparent p-0 text-[color:var(--page-muted)] hover:border-[color:var(--page-border)] hover:text-[color:var(--page-text)] ${viewMode === mode ? 'border-[color:var(--page-border)] text-[color:var(--page-text)]' : ''}`}
                  aria-label={mode === 'cards' ? 'Card view' : 'Long card view'}
                  aria-pressed={viewMode === mode}
                  title={mode === 'cards' ? 'Card view' : 'Long card view'}
                  onClick={() => setViewMode(mode)}>
                  <PlaylistViewIcon mode={mode} />
                </button>
              ))}
            </fieldset>
          </div>
        </header>

        {selectedPlaylist.tracks.length > 0 ? (
          viewMode === 'cards' ? (
            <ol className='m-0 grid list-none grid-cols-4 gap-x-2 gap-y-9 p-0 max-[700px]:grid-cols-3 max-[700px]:gap-x-2 max-[700px]:gap-y-7 max-[479px]:gap-x-3 max-[479px]:gap-y-6'>
              {selectedPlaylist.tracks.map((track, trackIndex) => (
                <li key={`${track.id}-${track.name}`} className='min-w-0'>
                  <a
                    className={`group block rounded-xl bg-[color-mix(in_srgb,var(--page-text)_4%,var(--page-background))] p-2 text-[color:var(--page-text)] no-underline transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--page-highlight)_12%,var(--page-background))] max-[700px]:bg-transparent max-[700px]:p-0 max-[700px]:hover:bg-transparent ${focusRingClassName}`}
                    href={track.url || undefined}
                    target='_blank'
                    rel='noreferrer'>
                    {track.albumImage ? (
                      <Image
                        src={track.albumImage}
                        alt=''
                        className='block h-auto w-full aspect-square rounded-lg bg-[color-mix(in_srgb,var(--page-text)_12%,transparent)] object-cover'
                        width={512}
                        height={512}
                        sizes='(max-width: 700px) 33vw, 25vw'
                        priority={trackIndex < 4}
                        loading={trackIndex < 4 ? 'eager' : 'lazy'}
                      />
                    ) : (
                      <span className='block w-full aspect-square rounded-lg bg-[color-mix(in_srgb,var(--page-text)_12%,transparent)]' />
                    )}
                    <span className='mt-3 flex min-w-0 flex-col font-ui text-sm leading-[1.5]'>
                      <MarqueeText className='font-medium group-hover:text-[color:var(--page-highlight)]'>
                        {track.name}
                      </MarqueeText>
                      <MarqueeText>{track.artists.join(', ')}</MarqueeText>
                      <MarqueeText className='text-[13px] text-[color:var(--page-muted)]'>
                        {track.album}
                      </MarqueeText>
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          ) : (
            <ul
              className='m-0 grid list-none gap-2 p-0'
              aria-label='Playlist songs'>
              {selectedPlaylist.tracks.map((track) => (
                <li className='min-w-0' key={`${track.id}-${track.name}`}>
                  <a
                    className={`flex min-w-0 items-center gap-4 rounded-xl bg-[color-mix(in_srgb,var(--page-text)_4%,var(--page-background))] p-3 font-ui text-[13px] leading-[1.4] text-[color:var(--page-text)] no-underline transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--page-highlight)_12%,var(--page-background))] ${focusRingClassName}`}
                    href={track.url || undefined}
                    target='_blank'
                    rel='noreferrer'>
                    {track.albumImage ? (
                      <Image
                        src={track.albumImage}
                        alt=''
                        className='block h-16 w-16 shrink-0 rounded-lg bg-[color-mix(in_srgb,var(--page-text)_12%,transparent)] object-cover'
                        width={64}
                        height={64}
                        sizes='64px'
                        loading='lazy'
                      />
                    ) : (
                      <span className='block aspect-square h-16 w-16 shrink-0 rounded-lg bg-[color-mix(in_srgb,var(--page-text)_12%,transparent)]' />
                    )}
                    <span className='flex min-w-0 flex-1 flex-col gap-0.5'>
                      <MarqueeText className='font-medium text-[color:var(--page-text)]'>
                        {track.name}
                      </MarqueeText>
                      <MarqueeText>{track.artists.join(', ')}</MarqueeText>
                      <MarqueeText className='text-[color:var(--page-muted)]'>
                        {track.album}
                      </MarqueeText>
                    </span>
                    {track.releaseYear ? (
                      <span className='shrink-0 self-start text-[12px] text-[color:var(--page-muted)] max-[479px]:hidden'>
                        {track.releaseYear}
                      </span>
                    ) : null}
                  </a>
                </li>
              ))}
            </ul>
          )
        ) : (
          <StatusMessage>This playlist has no stored tracks.</StatusMessage>
        )}
      </section>
    </section>
  )
}

export default PlaylistExplorer
