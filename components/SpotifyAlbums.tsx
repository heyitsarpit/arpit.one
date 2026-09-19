import { useQuery } from '@tanstack/react-query'
import { type CSSProperties, useState } from 'react'

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

const AlbumCard: React.FC<{ album: Album }> = ({ album }) => (
  <li>
    <a
      className='site-album-card'
      href={album.url || undefined}
      target='_blank'
      rel='noreferrer'>
      {album.image ? (
        <img className='site-album-art' src={album.image} alt='' />
      ) : (
        <span className='site-album-art-placeholder' />
      )}
      <span className='site-album-copy'>
        <strong>{album.name}</strong>
        <span>{album.artists.join(', ')}</span>
        {album.releaseYear ? <em>{album.releaseYear}</em> : null}
      </span>
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
  const albumGridStyle = {
    '--album-columns': columns
  } as CSSProperties
  const albumGridClassName = `site-album-grid site-album-grid-density-${columns}`
  const albumGroups = groupAlbums(sortAlbums(albums, sort), group)

  return (
    <section className='site-albums' aria-labelledby='saved-albums-title'>
      <header className='site-albums-header'>
        <div>
          <p className='site-section-kicker'>My Spotify library</p>
          <h1 id='saved-albums-title' className='site-section-title'>
            Albums
          </h1>
        </div>
        <div className='site-albums-meta'>
          <div className='site-albums-browse-controls'>
            <select
              aria-label='Sort albums'
              className='site-albums-select'
              value={sort}
              onChange={(event) => setSort(event.target.value as AlbumSort)}>
              <option value='recent'>Recently added</option>
              <option value='artist'>Artist A–Z</option>
              <option value='year-desc'>Release year: newest</option>
              <option value='year-asc'>Release year: oldest</option>
            </select>
            <select
              aria-label='Group albums'
              className='site-albums-select'
              value={group}
              onChange={(event) => setGroup(event.target.value as AlbumGroup)}>
              <option value='none'>No grouping</option>
              <option value='artist'>Group by artist</option>
              <option value='decade'>Group by decade</option>
            </select>
          </div>
          <div className='site-albums-layout-control'>
            <input
              id='albums-per-row'
              type='range'
              min='3'
              max='10'
              step='1'
              value={columns}
              aria-label='Album density'
              onChange={(event) => setColumns(Number(event.target.value))}
            />
          </div>
        </div>
      </header>

      {errorMessage ? (
        <p className='site-spotify-status site-albums-status'>{errorMessage}</p>
      ) : null}

      {!errorMessage && isPending && !state ? (
        <div
          className={`${albumGridClassName} is-loading`}
          data-density={columns}
          style={albumGridStyle}
          aria-label='Loading albums'>
          {loadingAlbums.map((album) => (
            <div key={album} className='site-album-card' aria-hidden='true'>
              <span className='site-album-art-placeholder' />
              <span className='site-album-loading-line' />
              <span className='site-album-loading-line is-short' />
            </div>
          ))}
        </div>
      ) : null}

      {!errorMessage && state && albums.length === 0 ? (
        <p className='site-spotify-status site-albums-status'>
          No saved albums found.
        </p>
      ) : null}

      {!errorMessage && state && albums.length > 0 ? (
        <div className='site-album-groups'>
          {albumGroups.map((albumGroup) => (
            <section className='site-album-group' key={albumGroup.key}>
              {albumGroup.label ? (
                <h2 className='site-album-group-title'>{albumGroup.label}</h2>
              ) : null}
              <ul
                className={albumGridClassName}
                data-density={columns}
                style={albumGridStyle}
                aria-label={
                  albumGroup.label
                    ? `${albumGroup.label} albums`
                    : 'Saved albums'
                }>
                {albumGroup.albums.map((album) => (
                  <AlbumCard key={album.id} album={album} />
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
