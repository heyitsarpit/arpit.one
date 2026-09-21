import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { useState } from 'react'

import {
  focusRingClassName,
  SectionHeading,
  StatusMessage
} from '@/components/SitePrimitives'

type Album = {
  id: string
  name: string
  artists: string[]
  image: string
  releaseYear: string
  totalTracks: number
  url: string
  addedAt: string
}

type ApiState = {
  configured: boolean
  albums: Album[]
  error?: string
}

type AlbumSort = 'recent' | 'artist' | 'year-desc' | 'year-asc'
type AlbumGroup = 'none' | 'artist' | 'decade'

const compareText = (left: string, right: string) =>
  left.localeCompare(right, undefined, { sensitivity: 'base' })

const getPrimaryArtist = (album: Album) => album.artists[0] || 'Various Artists'

const getReleaseYear = (album: Album) => {
  const year = Number.parseInt(album.releaseYear, 10)
  return Number.isNaN(year) || year <= 0 ? null : year
}

const sortAlbums = (albums: Album[], sort: AlbumSort) =>
  [...albums].sort((left, right) => {
    if (sort === 'recent') {
      const leftDate = Date.parse(left.addedAt)
      const rightDate = Date.parse(right.addedAt)
      const leftHasDate = !Number.isNaN(leftDate)
      const rightHasDate = !Number.isNaN(rightDate)

      if (leftHasDate && rightHasDate && leftDate !== rightDate) {
        return rightDate - leftDate
      }

      if (leftHasDate !== rightHasDate) return leftHasDate ? -1 : 1
    }

    if (sort === 'artist') {
      const artistOrder = compareText(
        getPrimaryArtist(left),
        getPrimaryArtist(right)
      )
      if (artistOrder !== 0) return artistOrder
    }

    if (sort === 'year-desc' || sort === 'year-asc') {
      const leftYear = getReleaseYear(left)
      const rightYear = getReleaseYear(right)

      if (leftYear !== null && rightYear !== null && leftYear !== rightYear) {
        return sort === 'year-desc'
          ? rightYear - leftYear
          : leftYear - rightYear
      }

      if ((leftYear === null) !== (rightYear === null)) {
        return leftYear === null ? 1 : -1
      }
    }

    const nameOrder = compareText(left.name, right.name)
    if (nameOrder !== 0) return nameOrder
    return compareText(left.id, right.id)
  })

const groupAlbums = (albums: Album[], group: AlbumGroup) => {
  if (group === 'none') {
    return [{ key: 'all', label: '', albums }]
  }

  const groups = new Map<string, Album[]>()

  for (const album of albums) {
    let key: string
    let label: string

    if (group === 'artist') {
      label = getPrimaryArtist(album)
      key = label
    } else {
      const year = getReleaseYear(album)
      label = year === null ? 'Unknown year' : `${Math.floor(year / 10) * 10}s`
      key = year === null ? 'unknown' : String(Math.floor(year / 10) * 10)
    }

    const existing = groups.get(key)
    if (existing) {
      existing.push(album)
    } else {
      groups.set(key, [album])
    }
  }

  return Array.from(groups.entries())
    .sort(([leftKey], [rightKey]) => {
      if (group === 'decade') {
        if (leftKey === 'unknown') return 1
        if (rightKey === 'unknown') return -1
        return Number(rightKey) - Number(leftKey)
      }

      return compareText(leftKey, rightKey)
    })
    .map(([key, albumsInGroup]) => ({
      key,
      label:
        group === 'artist'
          ? getPrimaryArtist(albumsInGroup[0])
          : key === 'unknown'
            ? 'Unknown year'
            : `${key}s`,
      albums: albumsInGroup
    }))
}

const albumGridClasses: Record<number, string> = {
  3: 'grid-cols-3 gap-x-6 gap-y-9',
  4: 'grid-cols-4 gap-x-6 gap-y-9',
  5: 'grid-cols-5 gap-x-6 gap-y-9',
  6: 'grid-cols-6 gap-x-6 gap-y-9',
  7: 'grid-cols-7 gap-x-[18px] gap-y-7',
  8: 'grid-cols-8 gap-x-4 gap-y-6',
  9: 'grid-cols-9 gap-x-[14px] gap-y-5',
  10: 'grid-cols-10 gap-x-3 gap-y-4'
}

const AlbumCard: React.FC<{ album: Album; columns: number }> = ({
  album,
  columns
}) => (
  <li>
    <a
      className={`${columns >= 7 ? 'rounded-none bg-transparent p-0 hover:bg-transparent' : 'rounded-2xl bg-[color-mix(in_srgb,var(--page-text)_4%,var(--page-background))] p-3 hover:bg-[color-mix(in_srgb,var(--page-highlight)_12%,var(--page-background))]'} block min-w-0 text-[color:var(--page-text)] no-underline transition-colors duration-200 focus-visible:bg-[color:var(--page-background)] ${focusRingClassName}`}
      href={album.url || undefined}
      target='_blank'
      rel='noreferrer'>
      {album.image ? (
        <Image
          className='block aspect-square w-full rounded-[10px] bg-[color-mix(in_srgb,var(--page-text)_9%,var(--page-background))] object-cover'
          src={album.image}
          alt=''
          width={512}
          height={512}
          sizes='(max-width: 700px) 50vw, 20vw'
          loading='lazy'
        />
      ) : (
        <span className='block aspect-square w-full rounded-[10px] bg-[color-mix(in_srgb,var(--page-text)_9%,var(--page-background))]' />
      )}
      {columns < 10 ? (
        <span
          className={`${columns >= 7 ? 'px-0' : 'px-1'} flex min-w-0 flex-col gap-[3px] pb-1 pt-3 font-ui text-[13px] leading-[1.4]`}>
          <strong className='overflow-hidden text-ellipsis whitespace-nowrap font-medium hover:text-[color:var(--page-highlight)]'>
            {album.name}
          </strong>
          {columns < 9 ? (
            <span className='overflow-hidden text-ellipsis whitespace-nowrap text-[color:var(--page-muted)]'>
              {album.artists.join(', ')}
            </span>
          ) : null}
          {columns < 8 && album.releaseYear ? (
            <em className='overflow-hidden text-ellipsis whitespace-nowrap text-[12px] not-italic text-[color:var(--page-muted)]'>
              {album.releaseYear}
            </em>
          ) : null}
        </span>
      ) : null}
    </a>
  </li>
)

const loadingAlbums = Array.from({ length: 12 }, (_, index) => index)

const fetchSpotifyAlbums = async (): Promise<ApiState> => {
  const response = await fetch('/api/spotify/albums')
  const payload = (await response.json()) as ApiState

  if (!response.ok && payload.configured !== false) {
    throw new Error(payload.error || 'Saved albums are unavailable.')
  }

  return payload
}

const SpotifyAlbums: React.FC = () => {
  const [columns, setColumns] = useState(7)
  const [sort, setSort] = useState<AlbumSort>('recent')
  const [group, setGroup] = useState<AlbumGroup>('none')
  const {
    data: state,
    error,
    isPending
  } = useQuery({
    queryKey: ['spotify', 'albums', 'v3'],
    queryFn: fetchSpotifyAlbums
  })

  const albums = state?.albums ?? []
  const errorMessage =
    state?.error ||
    (state && !state.configured
      ? 'Spotify albums are unavailable.'
      : undefined) ||
    error?.message
  const albumGridClassName = `grid list-none m-0 p-0 ${albumGridClasses[columns]} max-[700px]:grid-cols-2 max-[700px]:gap-x-4 max-[700px]:gap-y-7`
  const albumGroups = groupAlbums(sortAlbums(albums, sort), group)

  return (
    <section className='w-full pb-16' aria-labelledby='saved-albums-title'>
      <header className='mb-9 flex items-end justify-between gap-6 max-[700px]:block'>
        <div>
          <SectionHeading kicker='My Spotify library' id='saved-albums-title'>
            Albums
          </SectionHeading>
        </div>
        <div className='flex flex-wrap items-end justify-end gap-[18px] max-[700px]:items-start max-[700px]:justify-start'>
          <div className='flex flex-wrap items-center justify-end gap-3.5 max-[700px]:justify-start'>
            <select
              aria-label='Sort albums'
              className='min-h-[26px] cursor-pointer rounded-none border-0 border-b border-[color-mix(in_srgb,var(--page-muted)_45%,transparent)] bg-transparent pb-[5px] pr-4 font-ui text-[12px] leading-none text-[color:var(--page-muted)] focus-visible:outline-2 focus-visible:outline-[color:var(--page-highlight)] focus-visible:outline-offset-4'
              value={sort}
              onChange={(event) => setSort(event.target.value as AlbumSort)}>
              <option value='recent'>Recently added</option>
              <option value='artist'>Artist A–Z</option>
              <option value='year-desc'>Release year: newest</option>
              <option value='year-asc'>Release year: oldest</option>
            </select>
            <select
              aria-label='Group albums'
              className='min-h-[26px] cursor-pointer rounded-none border-0 border-b border-[color-mix(in_srgb,var(--page-muted)_45%,transparent)] bg-transparent pb-[5px] pr-4 font-ui text-[12px] leading-none text-[color:var(--page-muted)] focus-visible:outline-2 focus-visible:outline-[color:var(--page-highlight)] focus-visible:outline-offset-4'
              value={group}
              onChange={(event) => setGroup(event.target.value as AlbumGroup)}>
              <option value='none'>No grouping</option>
              <option value='artist'>Group by artist</option>
              <option value='decade'>Group by decade</option>
            </select>
          </div>
          <div className='flex items-center max-[700px]:hidden'>
            <input
              id='albums-per-row'
              type='range'
              min='3'
              max='10'
              step='1'
              value={columns}
              aria-label='Album density'
              className='m-0 h-[14px] w-32 cursor-pointer accent-[color:var(--page-highlight)]'
              onChange={(event) => setColumns(Number(event.target.value))}
            />
          </div>
        </div>
      </header>

      {errorMessage ? (
        <StatusMessage className='min-h-40 py-8'>{errorMessage}</StatusMessage>
      ) : null}

      {!errorMessage && isPending && !state ? (
        <div
          className={`${albumGridClassName} is-loading`}
          data-density={columns}
          role='status'
          aria-label='Loading albums'>
          {loadingAlbums.map((album) => (
            <div
              key={album}
              className='block min-w-0 rounded-2xl bg-[color-mix(in_srgb,var(--page-text)_4%,var(--page-background))] p-3'
              aria-hidden='true'>
              <span className='block aspect-square w-full rounded-[10px] bg-[color-mix(in_srgb,var(--page-text)_9%,var(--page-background))] animate-pulse' />
              <span className='mt-3 block h-3 w-[76%] rounded-full bg-[color-mix(in_srgb,var(--page-text)_12%,transparent)] animate-pulse' />
              <span className='mt-[7px] block h-3 w-[52%] rounded-full bg-[color-mix(in_srgb,var(--page-text)_12%,transparent)] animate-pulse' />
            </div>
          ))}
        </div>
      ) : null}

      {!errorMessage && state && albums.length === 0 ? (
        <StatusMessage className='min-h-40 py-8'>
          No saved albums found.
        </StatusMessage>
      ) : null}

      {!errorMessage && state && albums.length > 0 ? (
        <div className='grid gap-14'>
          {albumGroups.map((albumGroup) => (
            <section className='min-w-0' key={albumGroup.key}>
              {albumGroup.label ? (
                <h2 className='mb-5 font-ui text-lg font-medium tracking-[-0.02em] text-[color:var(--page-text)]'>
                  {albumGroup.label}
                </h2>
              ) : null}
              <ul
                className={albumGridClassName}
                data-density={columns}
                aria-label={
                  albumGroup.label
                    ? `${albumGroup.label} albums`
                    : 'Saved albums'
                }>
                {albumGroup.albums.map((album) => (
                  <AlbumCard key={album.id} album={album} columns={columns} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : null}
    </section>
  )
}

export default SpotifyAlbums
