import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'

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
      className={`site-playlist-marquee${
        distance > 1 ? ' is-overflowing' : ''
      } ${className}`}
      style={style}>
      <span className='site-playlist-marquee-content'>{children}</span>
    </span>
  )
}

const PlaylistViewIcon = ({ mode }: { mode: ViewMode }) => {
  if (mode === 'cards') {
    return (
      <svg viewBox='0 0 24 24' aria-hidden='true'>
        <rect x='3' y='3' width='8' height='8' rx='1' />
        <rect x='13' y='3' width='8' height='8' rx='1' />
        <rect x='3' y='13' width='8' height='8' rx='1' />
        <rect x='13' y='13' width='8' height='8' rx='1' />
      </svg>
    )
  }

  return (
    <svg viewBox='0 0 24 24' aria-hidden='true'>
      <path d='M4 6h16M4 12h16M4 18h16' />
    </svg>
  )
}

const SpotifyLogoIcon = () => (
  <svg viewBox='0 0 24 24' aria-hidden='true'>
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
  const [selectedId, setSelectedId] = useState(playlists[0]?.id || '')
  const [viewMode, setViewMode] = useState<ViewMode>('cards')
  const selectedPlaylist = useMemo(
    () => playlists.find((playlist) => playlist.id === selectedId),
    [playlists, selectedId]
  )

  if (!selectedPlaylist) {
    return (
      <section className='site-playlist-explorer site-playlist-explorer-empty'>
        <p className='site-spotify-status'>
          No stored playlists yet. Run <code>pnpm spotify:sync</code> after
          authorizing playlist access.
        </p>
      </section>
    )
  }

  return (
    <section className='site-playlist-explorer' aria-label='Playlist explorer'>
      <nav className='site-playlist-sidebar' aria-label='Playlists'>
        <ul className='site-playlist-list'>
          {playlists.map((playlist) => {
            const isSelected = playlist.id === selectedPlaylist.id

            return (
              <li key={playlist.id}>
                <button
                  type='button'
                  className={`site-playlist-list-item${
                    isSelected ? ' is-selected' : ''
                  }`}
                  aria-pressed={isSelected}
                  onClick={() => setSelectedId(playlist.id)}>
                  {playlist.image ? (
                    <img
                      src={playlist.image}
                      alt=''
                      className='site-playlist-list-image'
                      loading='lazy'
                      decoding='async'
                    />
                  ) : (
                    <span className='site-playlist-list-image is-empty' />
                  )}
                  <span className='site-playlist-list-copy'>
                    <strong>{playlist.name}</strong>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      <section className='site-playlist-detail' aria-live='polite'>
        <header className='site-playlist-detail-header'>
          <div>
            <h2>{selectedPlaylist.name}</h2>
            {selectedPlaylist.description ? (
              <p className='site-playlist-description'>
                {selectedPlaylist.description}
              </p>
            ) : null}
            {selectedPlaylist.url ? (
              <a
                className='site-inline-link site-playlist-open-link'
                href={selectedPlaylist.url}
                target='_blank'
                rel='noreferrer'>
                <SpotifyLogoIcon />
                <span>Open in Spotify</span>
                <span aria-hidden='true'>↗</span>
              </a>
            ) : null}
          </div>
          <div className='site-playlist-detail-actions'>
            <div
              className='site-playlist-view-toggle'
              aria-label='Playlist view'>
              {(['cards', 'table'] as const).map((mode) => (
                <button
                  key={mode}
                  type='button'
                  className={viewMode === mode ? 'is-active' : ''}
                  aria-label={mode === 'cards' ? 'Card view' : 'Table view'}
                  aria-pressed={viewMode === mode}
                  title={mode === 'cards' ? 'Card view' : 'Table view'}
                  onClick={() => setViewMode(mode)}>
                  <PlaylistViewIcon mode={mode} />
                </button>
              ))}
            </div>
          </div>
        </header>

        {selectedPlaylist.tracks.length > 0 ? (
          viewMode === 'cards' ? (
            <ol className='site-playlist-track-list'>
              {selectedPlaylist.tracks.map((track, index) => (
                <li
                  key={`${track.id}-${index}`}
                  className='site-playlist-track'>
                  <a
                    className='site-playlist-track-card'
                    href={track.url || undefined}
                    target='_blank'
                    rel='noreferrer'>
                    {track.albumImage ? (
                      <img
                        src={track.albumImage}
                        alt=''
                        className='site-playlist-track-art'
                        loading='lazy'
                        decoding='async'
                      />
                    ) : (
                      <span className='site-playlist-track-art is-empty' />
                    )}
                    <span className='site-playlist-track-main'>
                      <MarqueeText className='site-playlist-track-title'>
                        {track.name}
                      </MarqueeText>
                      <MarqueeText>{track.artists.join(', ')}</MarqueeText>
                      <MarqueeText className='site-playlist-track-album'>
                        {track.album}
                      </MarqueeText>
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          ) : (
            <>
              <div className='site-playlist-table-header' aria-hidden='true'>
                <span />
                <span>Song</span>
                <span>Artist</span>
                <span>Album</span>
                <span>Year</span>
              </div>
              <ul className='site-playlist-table' aria-label='Playlist songs'>
                {selectedPlaylist.tracks.map((track, index) => (
                  <li key={`${track.id}-${index}`}>
                    <a
                      className='site-playlist-table-row'
                      href={track.url || undefined}
                      target='_blank'
                      rel='noreferrer'>
                      {track.albumImage ? (
                        <img
                          src={track.albumImage}
                          alt=''
                          className='site-playlist-table-art'
                          loading='lazy'
                          decoding='async'
                        />
                      ) : (
                        <span className='site-playlist-table-art is-empty' />
                      )}
                      <MarqueeText className='site-playlist-table-song'>
                        {track.name}
                      </MarqueeText>
                      <MarqueeText>{track.artists.join(', ')}</MarqueeText>
                      <MarqueeText className='site-playlist-table-album'>
                        {track.album}
                      </MarqueeText>
                      <span className='site-playlist-table-year'>
                        {track.releaseYear || '—'}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )
        ) : (
          <p className='site-spotify-status'>
            This playlist has no stored tracks.
          </p>
        )}
      </section>
    </section>
  )
}

export default PlaylistExplorer
