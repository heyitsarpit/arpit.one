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

const PlaylistExplorer: React.FC<Props> = ({ playlists }) => {
  const [selectedId, setSelectedId] = useState(playlists[0]?.id || '')
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
          </div>
          {selectedPlaylist.url ? (
            <a
              className='site-inline-link site-playlist-open-link'
              href={selectedPlaylist.url}
              target='_blank'
              rel='noreferrer'>
              Open in Spotify ↗
            </a>
          ) : null}
        </header>

        {selectedPlaylist.tracks.length > 0 ? (
          <ol className='site-playlist-track-list'>
            {selectedPlaylist.tracks.map((track, index) => (
              <li key={`${track.id}-${index}`} className='site-playlist-track'>
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
          <p className='site-spotify-status'>
            This playlist has no stored tracks.
          </p>
        )}
      </section>
    </section>
  )
}

export default PlaylistExplorer
