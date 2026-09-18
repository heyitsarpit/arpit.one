import Image, { type StaticImageData } from 'next/image'
import { useCallback, useEffect, useState } from 'react'

import {
  type ArtCuration,
  type CuratedSpan,
  artCuration
} from '@/data/artCuration'
import { photography } from '@/data/photography'
import { images, videos } from '@/utils/arts'

type ArtworkItem = {
  id: string
  shareId: string
  kind: 'artwork'
  source: StaticImageData
  ratio: number
  timelineKey: string
  dateLabel: string
}

type MotionItem = {
  id: string
  shareId: string
  kind: 'motion'
  source: string
  poster?: string
  ratio: number
  timelineKey: string
  dateLabel: string
}

type PhotographyItem = {
  id: string
  shareId: string
  kind: 'photography'
  source: string
  width: number
  height: number
  ratio: number
  timelineKey: string
  dateLabel: string
  camera: (typeof photography)[number]['camera']
  lens: (typeof photography)[number]['lens']
  settings: (typeof photography)[number]['settings']
}

type ArtItem = ArtworkItem | MotionItem | PhotographyItem
type CuratedPlacement = {
  item: ArtItem
  span: CuratedSpan
}
type LayoutMode = 'curated' | 'small'

const sourceDatePattern = /(\d{4}-\d{2}-\d{2})/

const formatDate = (date: string, includeDay = true) => {
  const value = new Date(`${date}${date.length === 7 ? '-01' : ''}T00:00:00Z`)

  return new Intl.DateTimeFormat('en-US', {
    day: includeDay ? 'numeric' : undefined,
    month: 'long',
    timeZone: 'UTC',
    year: 'numeric'
  }).format(value)
}

const getDateFromSource = (source: string) =>
  source.match(sourceDatePattern)?.[1] ?? '1970-01-01'

const getDeviceName = (device: { make: string; model: string }) =>
  device.model.toLowerCase().startsWith(device.make.toLowerCase())
    ? device.model
    : `${device.make} ${device.model}`

const artworkItems: ArtworkItem[] = images.map((image, index) => {
  const date = getDateFromSource(image.src)

  return {
    id: `image-${index}-${image.src}`,
    shareId: `artwork-${date}-${index}`,
    kind: 'artwork',
    source: image,
    ratio: image.width / image.height,
    timelineKey: date.slice(0, 7),
    dateLabel: formatDate(date, false)
  }
})

const motionItems: MotionItem[] = videos.map(
  ([source, poster, ratio], index) => {
    const date = getDateFromSource(source)

    return {
      id: `video-${index}-${source}`,
      shareId: `motion-${date}-${index}`,
      kind: 'motion',
      source,
      poster,
      ratio,
      timelineKey: date.slice(0, 7),
      dateLabel: formatDate(date, false)
    }
  }
)

const photographyItems: PhotographyItem[] = photography.map((photo) => ({
  id: `photography-${photo.id}`,
  shareId: `photography-${photo.id}`,
  kind: 'photography',
  source: photo.url,
  width: photo.width,
  height: photo.height,
  ratio: photo.width / photo.height,
  timelineKey: photo.capturedDate.slice(0, 7),
  dateLabel: formatDate(photo.capturedDate, false),
  camera: photo.camera,
  lens: photo.lens,
  settings: photo.settings
}))

const artItems: ArtItem[] = [
  ...artworkItems,
  ...motionItems,
  ...photographyItems
].sort((first, second) => second.timelineKey.localeCompare(first.timelineKey))

const timelineGroups = artItems.reduce<
  Array<{ date: string; items: ArtItem[] }>
>((groups, item) => {
  const group = groups.find(({ date }) => date === item.timelineKey)

  if (group) {
    group.items.push(item)
  } else {
    groups.push({ date: item.timelineKey, items: [item] })
  }

  return groups
}, [])

const getCuratedPlacements = (
  group: { date: string; items: ArtItem[] },
  manifest: ArtCuration
): CuratedPlacement[] => {
  const itemsById = new Map(group.items.map((item) => [item.id, item]))
  const configured = manifest[group.date] ?? []
  const configuredIds = new Set<string>()
  const placements: CuratedPlacement[] = []

  for (const entry of configured) {
    const item = itemsById.get(entry.id)
    if (!item || configuredIds.has(entry.id)) continue
    configuredIds.add(entry.id)
    placements.push({ item, span: entry.span })
  }

  for (const item of group.items) {
    if (!configuredIds.has(item.id)) placements.push({ item, span: 'half' })
  }

  return placements
}

const getItemLabel = (item: ArtItem) => {
  if (item.kind === 'motion') return 'Motion'
  if (item.kind === 'photography') return 'Photography'
  return 'Artwork'
}

const isLayoutMode = (value: string | null): value is LayoutMode =>
  value === 'curated' || value === 'small'

function LayoutIcon({ mode }: { mode: LayoutMode }) {
  if (mode === 'curated') {
    return (
      <svg viewBox='0 0 24 24' aria-hidden='true'>
        <rect x='3' y='3' width='18' height='9' rx='1' />
        <rect x='3' y='15' width='8' height='6' rx='1' />
        <rect x='13' y='15' width='8' height='6' rx='1' />
      </svg>
    )
  }

  return (
    <svg viewBox='0 0 24 24' aria-hidden='true'>
      <rect x='3' y='3' width='5' height='5' rx='1' />
      <rect x='9.5' y='3' width='5' height='5' rx='1' />
      <rect x='16' y='3' width='5' height='5' rx='1' />
      <rect x='3' y='9.5' width='5' height='5' rx='1' />
      <rect x='9.5' y='9.5' width='5' height='5' rx='1' />
      <rect x='16' y='9.5' width='5' height='5' rx='1' />
      <rect x='3' y='16' width='5' height='5' rx='1' />
      <rect x='9.5' y='16' width='5' height='5' rx='1' />
      <rect x='16' y='16' width='5' height='5' rx='1' />
    </svg>
  )
}

function Play() {
  return (
    <svg
      viewBox='0 0 20 20'
      fill='currentColor'
      aria-hidden='true'
      className='site-art-play-icon'>
      <path
        fillRule='evenodd'
        d='M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z'
        clipRule='evenodd'
      />
    </svg>
  )
}

function ArtMedia({
  item,
  sizes,
  priority = false
}: {
  item: ArtItem
  sizes: string
  priority?: boolean
}) {
  if (item.kind === 'artwork') {
    return (
      <Image
        src={item.source}
        alt=''
        fill
        priority={priority}
        sizes={sizes}
        placeholder='blur'
        blurDataURL={item.source.blurDataURL}
      />
    )
  }

  if (item.kind === 'photography') {
    return (
      <Image
        src={item.source}
        alt={`${getDeviceName(item.camera)} photograph`}
        fill
        priority={priority}
        sizes={sizes}
        unoptimized
      />
    )
  }

  return (
    <>
      <video
        src={item.source}
        poster={item.poster}
        muted
        playsInline
        preload='metadata'
      />
      <span className='site-art-play-button' aria-hidden='true'>
        <Play />
      </span>
    </>
  )
}

function LightboxMedia({ item }: { item: ArtItem }) {
  if (item.kind === 'artwork') {
    return (
      <Image
        src={item.source}
        alt=''
        width={item.source.width}
        height={item.source.height}
        className='site-art-lightbox-media'
        data-landscape={item.ratio > 1 ? 'true' : 'false'}
        sizes='92vw'
        priority
        placeholder='blur'
        blurDataURL={item.source.blurDataURL}
      />
    )
  }

  if (item.kind === 'photography') {
    return (
      <Image
        src={item.source}
        alt={`${getDeviceName(item.camera)} photograph`}
        width={item.width}
        height={item.height}
        className='site-art-lightbox-media'
        data-landscape={item.ratio > 1 ? 'true' : 'false'}
        sizes='92vw'
        priority
        unoptimized
      />
    )
  }

  return (
    // biome-ignore lint/a11y/useMediaCaption: Art videos are visual-only and contain no dialogue.
    <video
      src={item.source}
      poster={item.poster}
      className='site-art-lightbox-media'
      data-landscape='true'
      controls
      autoPlay
      playsInline
    />
  )
}

function CuratorPanel({
  curation,
  onExport,
  onMove,
  onReset,
  onToggleSpan
}: {
  curation: ArtCuration
  onExport: () => void
  onMove: (date: string, index: number, direction: number) => void
  onReset: (date: string) => void
  onToggleSpan: (date: string, index: number) => void
}) {
  return (
    <aside className='site-art-curator'>
      <div className='site-art-curator-header'>
        <div>
          <p className='site-art-kicker'>Development only</p>
          <h2>Curate order</h2>
        </div>
        <button type='button' onClick={onExport}>
          Export manifest
        </button>
      </div>
      <p className='site-art-curator-help'>
        Move items, choose a wide span, then export the manifest into
        <code>data/artCuration.ts</code>.
      </p>
      <div className='site-art-curator-groups'>
        {timelineGroups.map((group) => {
          const placements = getCuratedPlacements(group, curation)

          return (
            <details key={group.date} open>
              <summary>{group.items[0]?.dateLabel}</summary>
              <ol>
                {placements.map((placement, index) => (
                  <li key={placement.item.id}>
                    <span className='site-art-curator-preview'>
                      <ArtMedia item={placement.item} sizes='64px' />
                    </span>
                    <span className='site-art-curator-item'>
                      {getItemLabel(placement.item)}
                    </span>
                    <button
                      type='button'
                      aria-label={`Move ${getItemLabel(placement.item).toLowerCase()} up`}
                      disabled={index === 0}
                      onClick={() => onMove(group.date, index, -1)}>
                      ↑
                    </button>
                    <button
                      type='button'
                      aria-label={`Move ${getItemLabel(placement.item).toLowerCase()} down`}
                      disabled={index === placements.length - 1}
                      onClick={() => onMove(group.date, index, 1)}>
                      ↓
                    </button>
                    <button
                      type='button'
                      aria-label={`Set ${getItemLabel(placement.item).toLowerCase()} ${placement.span === 'wide' ? 'half width' : 'wide'}`}
                      onClick={() => onToggleSpan(group.date, index)}>
                      {placement.span === 'wide' ? 'Wide' : 'Half'}
                    </button>
                  </li>
                ))}
              </ol>
              <button
                type='button'
                className='site-art-curator-reset'
                onClick={() => onReset(group.date)}>
                Reset month
              </button>
            </details>
          )
        })}
      </div>
    </aside>
  )
}

export function ArtGallery() {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('curated')
  const [curation, setCuration] = useState<ArtCuration>(artCuration)
  const [editorEnabled, setEditorEnabled] = useState(false)
  const [layoutReady, setLayoutReady] = useState(false)
  const [urlReady, setUrlReady] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const lightboxItem = lightboxIndex === null ? null : artItems[lightboxIndex]

  useEffect(() => {
    const readItemFromUrl = () => {
      const shareId = new URLSearchParams(window.location.search).get('item')
      const nextIndex = artItems.findIndex((item) => item.shareId === shareId)
      setLightboxIndex(nextIndex === -1 ? null : nextIndex)
    }

    readItemFromUrl()
    setUrlReady(true)
    window.addEventListener('popstate', readItemFromUrl)

    return () => window.removeEventListener('popstate', readItemFromUrl)
  }, [])

  useEffect(() => {
    if (!urlReady) return

    const url = new URL(window.location.href)
    if (lightboxIndex === null) {
      url.searchParams.delete('item')
    } else {
      url.searchParams.set('item', artItems[lightboxIndex].shareId)
    }

    window.history.replaceState(
      null,
      '',
      `${url.pathname}${url.search}${url.hash}`
    )
  }, [lightboxIndex, urlReady])

  useEffect(() => {
    try {
      const storedLayout = window.localStorage.getItem('art-layout-mode')
      if (isLayoutMode(storedLayout)) setLayoutMode(storedLayout)

      const storedCuration = window.localStorage.getItem('art-curation')
      if (storedCuration) {
        const parsedCuration = JSON.parse(storedCuration) as ArtCuration
        if (parsedCuration && typeof parsedCuration === 'object')
          setCuration(parsedCuration)
      }

      setEditorEnabled(
        process.env.NODE_ENV === 'development' &&
          new URLSearchParams(window.location.search).get('edit') === '1'
      )
    } catch {
      // Local storage can be unavailable in private browsing contexts.
    }
    setLayoutReady(true)
  }, [])

  useEffect(() => {
    if (!layoutReady) return
    try {
      window.localStorage.setItem('art-layout-mode', layoutMode)
      window.localStorage.setItem('art-curation', JSON.stringify(curation))
    } catch {
      // Local storage can be unavailable in private browsing contexts.
    }
  }, [curation, layoutMode, layoutReady])

  const updateCurationGroup = (
    date: string,
    update: (placements: CuratedPlacement[]) => CuratedPlacement[]
  ) => {
    const group = timelineGroups.find(
      (timelineGroup) => timelineGroup.date === date
    )
    if (!group) return

    setCuration((current) => ({
      ...current,
      [date]: update(getCuratedPlacements(group, current)).map(
        ({ item, span }) => ({ id: item.id, span })
      )
    }))
  }

  const moveCuratedItem = (date: string, index: number, direction: number) => {
    updateCurationGroup(date, (placements) => {
      const nextIndex = index + direction
      if (nextIndex < 0 || nextIndex >= placements.length) return placements

      const nextPlacements = [...placements]
      const [movedPlacement] = nextPlacements.splice(index, 1)
      nextPlacements.splice(nextIndex, 0, movedPlacement)
      return nextPlacements
    })
  }

  const toggleCuratedSpan = (date: string, index: number) => {
    updateCurationGroup(date, (placements) =>
      placements.map((placement, placementIndex) =>
        placementIndex === index
          ? { ...placement, span: placement.span === 'wide' ? 'half' : 'wide' }
          : placement
      )
    )
  }

  const resetCuratedMonth = (date: string) => {
    setCuration((current) => {
      const nextCuration = { ...current }
      delete nextCuration[date]
      return nextCuration
    })
  }

  const exportCuration = () => {
    const file = `export type CuratedSpan = 'half' | 'wide'

export type CuratedEntry = {
  id: string
  span: CuratedSpan
}

export type ArtCuration = Record<string, CuratedEntry[]>

export const artCuration: ArtCuration = ${JSON.stringify(curation, null, 2)}
`
    const url = URL.createObjectURL(new Blob([file], { type: 'text/plain' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'artCuration.ts'
    link.click()
    URL.revokeObjectURL(url)
  }

  const moveLightbox = useCallback((direction: number) => {
    setLightboxIndex((currentIndex) => {
      if (currentIndex === null) return currentIndex
      return (currentIndex + direction + artItems.length) % artItems.length
    })
  }, [])

  useEffect(() => {
    if (lightboxIndex === null) return

    const previousOverflow = document.body.style.overflow
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightboxIndex(null)
      if (event.key === 'ArrowLeft') moveLightbox(-1)
      if (event.key === 'ArrowRight') moveLightbox(1)
    }

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [lightboxIndex, moveLightbox])

  return (
    <div className='site-art'>
      <header className='site-art-toolbar'>
        <div>
          <p className='site-art-kicker'>Archive / Timeline</p>
          <h1>Art &amp; photography</h1>
        </div>
        <div className='site-art-layout-toggle' aria-label='Artwork layout'>
          {(['curated', 'small'] as const).map((mode) => (
            <button
              key={mode}
              type='button'
              className={layoutMode === mode ? 'is-active' : ''}
              aria-label={
                mode === 'small' ? 'Small grid layout' : 'Curated layout'
              }
              aria-pressed={layoutMode === mode}
              title={mode === 'small' ? 'Small grid' : 'Curated'}
              onClick={() => setLayoutMode(mode)}>
              <LayoutIcon mode={mode} />
            </button>
          ))}
        </div>
      </header>

      {editorEnabled ? (
        <CuratorPanel
          curation={curation}
          onExport={exportCuration}
          onMove={moveCuratedItem}
          onReset={resetCuratedMonth}
          onToggleSpan={toggleCuratedSpan}
        />
      ) : null}

      <div className='site-art-timeline'>
        {timelineGroups.map((group) => (
          <section className='site-art-timeline-group' key={group.date}>
            <div className='site-art-timeline-date'>
              <time dateTime={group.date}>
                {group.items[0]?.dateLabel ?? formatDate(group.date, false)}
              </time>
            </div>
            <div className={`site-art-grid site-art-grid--${layoutMode}`}>
              {(layoutMode === 'curated'
                ? getCuratedPlacements(group, curation)
                : group.items.map((item) => ({ item, span: 'half' as const }))
              ).map((placement, index) => {
                const item = placement.item
                const itemIndex = artItems.indexOf(item)

                return (
                  <button
                    key={item.id}
                    type='button'
                    className={`site-art-card${
                      layoutMode === 'curated' && placement.span === 'wide'
                        ? ' site-art-card--wide'
                        : ''
                    }`}
                    aria-label={`Open ${getItemLabel(item).toLowerCase()} from ${item.dateLabel}`}
                    onClick={() => setLightboxIndex(itemIndex)}>
                    <span
                      className='site-art-media'
                      style={{ aspectRatio: item.ratio }}>
                      <ArtMedia
                        item={item}
                        sizes={
                          layoutMode === 'small'
                            ? '(max-width: 479px) 45vw, (max-width: 900px) 30vw, 22vw'
                            : '(max-width: 479px) 92vw, 45vw'
                        }
                        priority={itemIndex < 4 || index < 2}
                      />
                    </span>
                  </button>
                )
              })}
            </div>
          </section>
        ))}
      </div>

      {lightboxItem ? (
        // biome-ignore lint/a11y/useKeyWithClickEvents: The dialog backdrop closes on click; Escape is handled globally.
        <dialog
          open
          className='site-art-lightbox'
          aria-label='Full screen artwork'
          onClick={(event) => {
            if (event.target === event.currentTarget) setLightboxIndex(null)
          }}>
          <button
            type='button'
            className='site-art-lightbox-close'
            aria-label='Close full screen artwork'
            onClick={() => setLightboxIndex(null)}>
            ×
          </button>
          <button
            type='button'
            className='site-art-lightbox-arrow site-art-lightbox-previous'
            aria-label='Previous artwork'
            onClick={(event) => {
              event.stopPropagation()
              moveLightbox(-1)
            }}>
            ←
          </button>
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: Stop image/content clicks from closing the backdrop. */}
          <div
            className='site-art-lightbox-content'
            onClick={(event) => {
              if (event.target === event.currentTarget) setLightboxIndex(null)
            }}>
            <LightboxMedia item={lightboxItem} />
          </div>
          <button
            type='button'
            className='site-art-lightbox-arrow site-art-lightbox-next'
            aria-label='Next artwork'
            onClick={(event) => {
              event.stopPropagation()
              moveLightbox(1)
            }}>
            →
          </button>
        </dialog>
      ) : null}
    </div>
  )
}
