import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

import type { StoredPlaylistLibrary } from '@/utils/playlists'

const ranges = [
  { value: 'short_term', label: '4 weeks' },
  { value: 'medium_term', label: '6 months' },
  { value: 'long_term', label: 'All time' }
] as const

type Range = (typeof ranges)[number]['value']

type TopArtist = {
  id: string
  name: string
  image: string
  url: string
}

type TopTrack = {
  id: string
  name: string
  artists: string[]
  album: string
  releaseYear: string
  image: string
  url: string
}

type ApiState = {
  configured: boolean
  range: Range
  artists: TopArtist[]
  tracks: TopTrack[]
  error?: string
}

type Props = {
  library: StoredPlaylistLibrary
}

const loadingRanks = Array.from({ length: 10 }, (_, index) => index)

const fetchSpotifyStats = async (range: Range): Promise<ApiState> => {
  const response = await fetch(`/api/spotify/stats?range=${range}`)
  const payload = (await response.json()) as ApiState

  if (!response.ok) {
    throw new Error(payload.error || 'Stats unavailable.')
  }

  return payload
}

const SpotifyStats: React.FC<Props> = ({ library }) => {
  const [range, setRange] = useState<Range>('medium_term')
  const {
    data: state,
    error,
    isPending
  } = useQuery({
    queryKey: ['spotify', 'stats', range],
    queryFn: () => fetchSpotifyStats(range)
  })

  const artists = state?.artists ?? []
  const tracks = state?.tracks ?? []

  const libraryStats = useMemo(() => {
    const artistCounts = new Map<
      string,
      {
        trackCount: number
        playlistNames: Set<string>
        image: string
        url: string
      }
    >()
    for (const playlist of library.playlists) {
      for (const track of playlist.tracks) {
        track.artists.forEach((artist, artistIndex) => {
          const current = artistCounts.get(artist) || {
            trackCount: 0,
            playlistNames: new Set<string>(),
            image: '',
            url: ''
          }
          current.trackCount += 1
          current.playlistNames.add(playlist.name)
          current.image ||= track.artistImages?.[artistIndex] || ''
          current.url ||= track.artistUrls?.[artistIndex] || ''
          artistCounts.set(artist, current)
        })
      }
    }

    const mostLovedArtists = Array.from(artistCounts.entries())
      .sort(([, left], [, right]) => right.trackCount - left.trackCount)
      .slice(0, 10)

    return {
      mostLovedArtists
    }
  }, [library])

  const errorMessage = state?.error || (!state ? error?.message : undefined)

  return (
    <div className='site-stats'>
      <section className='site-stats-top' aria-labelledby='top-stats'>
        <header className='site-stats-top-header'>
          <h2 id='top-stats'>Top played</h2>
          <fieldset className='site-stats-range-switcher'>
            <legend>Listening period</legend>
            {ranges.map((item) => (
              <button
                key={item.value}
                type='button'
                aria-pressed={range === item.value}
                className={range === item.value ? 'is-selected' : ''}
                onClick={() => setRange(item.value)}>
                {item.label}
              </button>
            ))}
          </fieldset>
        </header>

        {errorMessage ? (
          <p className='site-spotify-status site-stats-status'>
            {errorMessage}
          </p>
        ) : (
          <>
            {error && state ? (
              <p className='site-stats-refresh-status' aria-live='polite'>
                Showing saved stats while Spotify reconnects.
              </p>
            ) : null}
            <div className='site-stats-ranking-grid'>
              <section aria-labelledby='top-artists'>
                <h3 id='top-artists'>Top played artists</h3>
                {isPending && !state ? (
                  <ol
                    className='site-stats-ranking is-loading'
                    aria-label='Loading artists'>
                    {loadingRanks.map((rank) => (
                      <li key={rank} aria-hidden='true'>
                        <span className='site-stats-rank'>{rank + 1}</span>
                        <span className='site-stats-image-placeholder' />
                        <span className='site-stats-loading-line' />
                      </li>
                    ))}
                  </ol>
                ) : (
                  <ol className='site-stats-ranking'>
                    {artists.map((artist, index) => (
                      <li key={artist.id || artist.name}>
                        <a
                          href={artist.url || undefined}
                          target='_blank'
                          rel='noreferrer'>
                          <span className='site-stats-rank'>{index + 1}</span>
                          {artist.image ? (
                            <img src={artist.image} alt='' />
                          ) : (
                            <span className='site-stats-image-placeholder' />
                          )}
                          <strong>{artist.name}</strong>
                        </a>
                      </li>
                    ))}
                  </ol>
                )}
              </section>

              <section aria-labelledby='top-tracks'>
                <h3 id='top-tracks'>Top played songs</h3>
                {isPending && !state ? (
                  <ol
                    className='site-stats-ranking is-loading'
                    aria-label='Loading songs'>
                    {loadingRanks.map((rank) => (
                      <li key={rank} aria-hidden='true'>
                        <span className='site-stats-rank'>{rank + 1}</span>
                        <span className='site-stats-image-placeholder' />
                        <span className='site-stats-loading-line' />
                      </li>
                    ))}
                  </ol>
                ) : (
                  <ol className='site-stats-ranking'>
                    {tracks.map((track, index) => (
                      <li key={track.id || `${track.name}-${index}`}>
                        <a
                          href={track.url || undefined}
                          target='_blank'
                          rel='noreferrer'>
                          <span className='site-stats-rank'>{index + 1}</span>
                          {track.image ? (
                            <img src={track.image} alt='' />
                          ) : (
                            <span className='site-stats-image-placeholder' />
                          )}
                          <span className='site-stats-ranking-copy'>
                            <strong>{track.name}</strong>
                            <span>
                              {[
                                track.artists.join(', '),
                                track.album,
                                track.releaseYear
                              ]
                                .filter(Boolean)
                                .join(' · ')}
                            </span>
                          </span>
                        </a>
                      </li>
                    ))}
                  </ol>
                )}
              </section>
            </div>
          </>
        )}
      </section>

      <section
        className='site-stats-collection site-stats-loved-artists'
        aria-labelledby='most-loved-artists'>
        <div className='site-stats-section-heading'>
          <p className='site-section-kicker'>Across my playlists</p>
          <h2 id='most-loved-artists'>Most loved artists</h2>
        </div>
        <ol className='site-stats-collected-list'>
          {libraryStats.mostLovedArtists.map(([artist, stats], index) => (
            <li key={artist}>
              <a
                className='site-stats-loved-artist-link'
                href={stats.url || undefined}
                target='_blank'
                rel='noreferrer'>
                <span className='site-stats-loved-artist-rank'>
                  {String(index + 1).padStart(2, '0')}
                </span>
                {stats.image ? (
                  <img
                    className='site-stats-loved-artist-image'
                    src={stats.image}
                    alt=''
                  />
                ) : (
                  <span className='site-stats-loved-artist-image-placeholder' />
                )}
                <span className='site-stats-loved-artist-copy'>
                  <strong>{artist}</strong>
                  <em>
                    {stats.trackCount} track appearances across{' '}
                    {stats.playlistNames.size}{' '}
                    {stats.playlistNames.size === 1 ? 'playlist' : 'playlists'}
                  </em>
                </span>
              </a>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}

export default SpotifyStats
