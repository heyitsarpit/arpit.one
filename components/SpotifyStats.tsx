import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { useMemo, useState } from 'react'

import {
  focusRingClassName,
  SectionHeading,
  StatusMessage
} from '@/components/SitePrimitives'
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

type RepeatedTrack = {
  track: StoredPlaylistLibrary['playlists'][number]['tracks'][number]
  appearances: number
  playlistNames: string[]
}

const loadingRanks = Array.from({ length: 10 }, (_, index) => index)
const parentheticalVersionSuffix =
  /\s*[[(](?=[^\])]*(?:\b(?:remaster(?:ed)?|live|unplugged|demo|mono|stereo|edit(?:ion)?|version|mix|rework|deluxe|bonus|alternate|radio|single|anniversary|session|take|rough|extended|explicit)\b))[^\])]*[\])]\s*/gi
const dashedVersionSuffix =
  /\s*[-–—]\s*(?:(?:\d{4}\s+)?(?:digital\s+)?remaster(?:ed)?|(?:\d{4}\s+)?remaster(?:ed)?|live(?:\s+at)?|unplugged|demo|mono|stereo|radio\s+edit|single\s+version|edit(?:ion)?|version|mix|rework|remix|deluxe(?:\s+edition)?|bonus(?:\s+track)?|alternate|anniversary|session|take|rough|extended|explicit).*$/i

const normalizeTrackTitle = (title: string) => {
  let normalized = title.normalize('NFKC').trim()

  normalized = normalized.replace(parentheticalVersionSuffix, ' ')
  normalized = normalized.replace(dashedVersionSuffix, '')

  return normalized.toLocaleLowerCase().replace(/\s+/g, ' ').trim()
}

const getTrackKey = (
  track: StoredPlaylistLibrary['playlists'][number]['tracks'][number]
) => {
  const artistId = track.artistUrls?.[0]?.split('/').pop() || ''
  const artist =
    artistId ||
    (track.artists[0] || '')
      .normalize('NFKC')
      .toLocaleLowerCase()
      .replace(/\s+/g, ' ')
      .trim()

  return `${artist}::${normalizeTrackTitle(track.name)}`
}

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

    const repeatedTracks = new Map<
      string,
      {
        track: StoredPlaylistLibrary['playlists'][number]['tracks'][number]
        appearances: number
        playlistNames: Set<string>
      }
    >()

    for (const playlist of library.playlists) {
      for (const track of playlist.tracks) {
        const key = getTrackKey(track)
        const current = repeatedTracks.get(key) || {
          track,
          appearances: 0,
          playlistNames: new Set<string>()
        }
        current.appearances += 1
        current.playlistNames.add(playlist.name)
        repeatedTracks.set(key, current)
      }
    }

    const quietFavorites = Array.from(repeatedTracks.values())
      .filter(({ playlistNames }) => playlistNames.size > 1)
      .sort((left, right) => {
        const playlistDifference =
          right.playlistNames.size - left.playlistNames.size
        if (playlistDifference !== 0) return playlistDifference

        const appearanceDifference = right.appearances - left.appearances
        if (appearanceDifference !== 0) return appearanceDifference

        return left.track.name.localeCompare(right.track.name)
      })
      .map(
        ({ track, appearances, playlistNames }): RepeatedTrack => ({
          track,
          appearances,
          playlistNames: Array.from(playlistNames)
        })
      )

    return {
      mostLovedArtists,
      quietFavorites
    }
  }, [library])

  const favoriteRows = useMemo(
    () =>
      libraryStats.quietFavorites
        .slice(0, 50)
        .map(({ track, playlistNames }) => ({
          key: `repeated-${getTrackKey(track)}`,
          name: track.name,
          artists: track.artists,
          album: track.album,
          releaseYear: track.releaseYear || '',
          image: track.albumImage,
          url: track.url,
          meta: `${playlistNames.length} ${
            playlistNames.length === 1 ? 'playlist' : 'playlists'
          }`
        })),
    [libraryStats.quietFavorites]
  )

  const errorMessage = state?.error || (!state ? error?.message : undefined)

  const rankingListClass = 'm-0 grid list-none gap-3 p-0'
  const rankingLinkClass = `grid min-w-0 grid-cols-[24px_72px_minmax(0,1fr)] items-center gap-3 rounded-[14px] bg-transparent p-2 font-ui text-sm leading-[1.4] text-[color:var(--page-text)] no-underline hover:bg-[color-mix(in_srgb,var(--page-highlight)_15%,var(--page-background))] ${focusRingClassName}`
  const imagePlaceholderClass =
    'block h-[72px] w-[72px] rounded-lg bg-[color-mix(in_srgb,var(--page-text)_12%,transparent)]'

  return (
    <div className='grid gap-[72px]'>
      <section aria-labelledby='top-stats'>
        <header className='mb-7 flex items-end justify-between gap-6 max-[700px]:block'>
          <h2
            id='top-stats'
            className='m-0 font-display text-[22px] font-normal leading-[1.35] text-[color:var(--page-text)]'>
            Top played
          </h2>
          <fieldset className='m-0 flex items-center gap-4 border-0 p-0 max-[700px]:ml-auto max-[700px]:mt-5 max-[700px]:w-fit max-[479px]:gap-3'>
            <legend className='sr-only'>Listening period</legend>
            {ranges.map((item) => (
              <button
                key={item.value}
                type='button'
                aria-pressed={range === item.value}
                className={`border-0 border-b border-transparent bg-transparent pb-1 font-ui text-[12px] text-[color:var(--page-muted)] ${range === item.value ? 'border-[color:var(--page-highlight)] text-[color:var(--page-text)]' : ''}`}
                onClick={() => setRange(item.value)}>
                {item.label}
              </button>
            ))}
          </fieldset>
        </header>

        {errorMessage ? (
          <StatusMessage className='min-h-40 py-8'>
            {errorMessage}
          </StatusMessage>
        ) : (
          <>
            {error && state ? (
              <p
                className='mb-5 font-ui text-[12px] text-[color:var(--page-muted)]'
                aria-live='polite'>
                Showing saved stats while Spotify reconnects.
              </p>
            ) : null}
            <div className='grid grid-cols-2 gap-14 max-[700px]:grid-cols-1 max-[700px]:gap-10'>
              <section aria-labelledby='top-artists'>
                <h3
                  id='top-artists'
                  className='mb-[18px] mt-0 font-display text-sm font-normal leading-[1.35] text-[color:var(--page-muted)]'>
                  Top played artists
                </h3>
                {isPending && !state ? (
                  <ol className={rankingListClass} aria-label='Loading artists'>
                    {loadingRanks.map((rank) => (
                      <li
                        key={rank}
                        className='grid grid-cols-[24px_72px_minmax(0,1fr)] items-center gap-3'
                        aria-hidden='true'>
                        <span className='text-right font-code text-[11px] text-[color:var(--page-muted)]'>
                          {rank + 1}
                        </span>
                        <span className={imagePlaceholderClass} />
                        <span className='block h-3 w-[min(72%,220px)] animate-pulse rounded-full bg-[color-mix(in_srgb,var(--page-text)_12%,transparent)]' />
                      </li>
                    ))}
                  </ol>
                ) : (
                  <ol className={rankingListClass}>
                    {artists.map((artist, index) => (
                      <li key={artist.id || artist.name}>
                        <a
                          className={rankingLinkClass}
                          href={artist.url || undefined}
                          target='_blank'
                          rel='noreferrer'>
                          <span className='text-right font-code text-[11px] text-[color:var(--page-muted)]'>
                            {index + 1}
                          </span>
                          {artist.image ? (
                            <Image
                              className={imagePlaceholderClass}
                              src={artist.image}
                              alt=''
                              width={72}
                              height={72}
                              sizes='72px'
                              loading='lazy'
                            />
                          ) : (
                            <span className={imagePlaceholderClass} />
                          )}
                          <strong className='overflow-hidden text-ellipsis whitespace-nowrap font-medium'>
                            {artist.name}
                          </strong>
                        </a>
                      </li>
                    ))}
                  </ol>
                )}
              </section>

              <section aria-labelledby='top-tracks'>
                <h3
                  id='top-tracks'
                  className='mb-[18px] mt-0 font-display text-sm font-normal leading-[1.35] text-[color:var(--page-muted)]'>
                  Top played songs
                </h3>
                {isPending && !state ? (
                  <ol className={rankingListClass} aria-label='Loading songs'>
                    {loadingRanks.map((rank) => (
                      <li
                        key={rank}
                        className='grid grid-cols-[24px_72px_minmax(0,1fr)] items-center gap-3'
                        aria-hidden='true'>
                        <span className='text-right font-code text-[11px] text-[color:var(--page-muted)]'>
                          {rank + 1}
                        </span>
                        <span className={imagePlaceholderClass} />
                        <span className='block h-3 w-[min(72%,220px)] animate-pulse rounded-full bg-[color-mix(in_srgb,var(--page-text)_12%,transparent)]' />
                      </li>
                    ))}
                  </ol>
                ) : (
                  <ol className={rankingListClass}>
                    {tracks.map((track, index) => (
                      <li
                        key={
                          track.id || `${track.name}-${track.artists.join('|')}`
                        }>
                        <a
                          className={rankingLinkClass}
                          href={track.url || undefined}
                          target='_blank'
                          rel='noreferrer'>
                          <span className='text-right font-code text-[11px] text-[color:var(--page-muted)]'>
                            {index + 1}
                          </span>
                          {track.image ? (
                            <Image
                              className={imagePlaceholderClass}
                              src={track.image}
                              alt=''
                              width={72}
                              height={72}
                              sizes='72px'
                              loading='lazy'
                            />
                          ) : (
                            <span className={imagePlaceholderClass} />
                          )}
                          <span className='flex min-w-0 flex-col'>
                            <strong className='overflow-hidden text-ellipsis whitespace-nowrap font-medium'>
                              {track.name}
                            </strong>
                            <span className='overflow-hidden text-ellipsis whitespace-nowrap text-[12px] leading-[1.45] text-[color:var(--page-muted)]'>
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

      <section className='w-full min-w-0' aria-labelledby='most-repeated-songs'>
        <SectionHeading
          as='h2'
          kicker='Repeated across my playlists'
          id='most-repeated-songs'>
          Most repeated songs
        </SectionHeading>
        {favoriteRows.length > 0 ? (
          <ol className='m-0 grid list-none grid-cols-3 gap-x-[30px] gap-y-1.5 p-0 max-[700px]:grid-cols-1 min-[701px]:max-[900px]:grid-cols-2'>
            {favoriteRows.map((track, index) => (
              <li key={track.key}>
                <a
                  className={`grid grid-cols-[20px_72px_minmax(0,1fr)] items-center gap-x-3.5 rounded-[10px] px-1.5 py-2 text-[color:var(--page-text)] no-underline transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--page-highlight)_10%,var(--page-background))] max-[479px]:grid-cols-[24px_56px_minmax(0,1fr)] max-[479px]:gap-3 max-[479px]:px-2 max-[479px]:py-2.5 ${focusRingClassName}`}
                  href={track.url || undefined}
                  target='_blank'
                  rel='noreferrer'>
                  <span className='text-right font-code text-[11px] text-[color:var(--page-muted)]'>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {track.image ? (
                    <Image
                      className='block h-[72px] w-[72px] rounded-lg bg-[color-mix(in_srgb,var(--page-text)_12%,transparent)] object-cover max-[479px]:h-14 max-[479px]:w-14'
                      src={track.image}
                      alt=''
                      width={72}
                      height={72}
                      sizes='(max-width: 479px) 56px, 72px'
                      loading='lazy'
                    />
                  ) : (
                    <span className='block h-[72px] w-[72px] rounded-lg bg-[color-mix(in_srgb,var(--page-text)_12%,transparent)] max-[479px]:h-14 max-[479px]:w-14' />
                  )}
                  <span className='flex min-w-0 flex-col gap-[3px]'>
                    <strong className='overflow-hidden text-ellipsis whitespace-nowrap font-display text-sm font-normal'>
                      {track.name}
                    </strong>
                    <span className='overflow-hidden text-ellipsis whitespace-nowrap font-ui text-[11px] text-[color:var(--page-muted)]'>
                      {[
                        track.artists.join(', '),
                        track.album,
                        track.releaseYear
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                    <em className='overflow-hidden text-ellipsis whitespace-nowrap font-ui text-[11px] not-italic text-[color:var(--page-muted)]'>
                      {track.meta}
                    </em>
                  </span>
                </a>
              </li>
            ))}
          </ol>
        ) : (
          <p className='m-0 font-ui text-[13px] text-[color:var(--page-muted)]'>
            No repeated songs found.
          </p>
        )}
      </section>

      <section className='w-full min-w-0' aria-labelledby='most-loved-artists'>
        <SectionHeading
          as='h2'
          className='mb-8'
          kicker='Across my playlists'
          id='most-loved-artists'>
          Most loved artists
        </SectionHeading>
        <ol className='m-0 grid list-none gap-1 p-0'>
          {libraryStats.mostLovedArtists.map(([artist, stats], index) => (
            <li key={artist}>
              <a
                className={`grid grid-cols-[32px_48px_minmax(0,1fr)] items-center gap-5 rounded-[14px] px-4 py-3 font-display text-xl text-[color:var(--page-text)] no-underline transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--page-highlight)_10%,var(--page-background))] max-[479px]:grid-cols-[24px_48px_minmax(0,1fr)] max-[479px]:gap-3 max-[479px]:px-2 max-[479px]:py-2.5 ${focusRingClassName}`}
                href={stats.url || undefined}
                target='_blank'
                rel='noreferrer'>
                <span className='text-right font-code text-[11px] text-[color:var(--page-muted)]'>
                  {String(index + 1).padStart(2, '0')}
                </span>
                {stats.image ? (
                  <Image
                    className='block h-12 w-12 shrink-0 rounded-full bg-[color-mix(in_srgb,var(--page-text)_12%,transparent)] object-cover'
                    src={stats.image}
                    alt=''
                    width={48}
                    height={48}
                    sizes='48px'
                    loading='lazy'
                  />
                ) : (
                  <span className='block h-12 w-12 shrink-0 rounded-full bg-[color-mix(in_srgb,var(--page-text)_12%,transparent)]' />
                )}
                <span className='flex min-w-0 flex-col gap-[3px]'>
                  <strong>{artist}</strong>
                  <em className='font-ui text-[12px] not-italic text-[color:var(--page-muted)]'>
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
