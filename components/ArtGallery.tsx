import Image from 'next/image'
import {
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'

import {
  type ArtCuration,
  type ArtView,
  type CurationGroup,
  type LayoutItem,
  artCuration,
  normalizeArtCuration
} from '@/data/artCuration'
import { photography } from '@/data/photography'
import { images, videos } from '@/utils/arts'

type ArtworkItem = {
  id: string
  shareId: string
  kind: 'artwork'
  source: string
  width: number
  height: number
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
type LayoutPlacement = {
  item: ArtItem
  layout: LayoutItem
}
type LayoutMode = ArtView
const layoutStorageKey = 'art-layout-mode-v3'
const curationStorageKey = 'art-curation-v3'

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

const getDeviceName = (device: { make?: string; model?: string }) => {
  const make = device.make?.trim()
  const model = device.model?.trim()

  if (!make && !model) return 'Unknown camera'
  if (!make) return model
  if (!model) return make

  return model.toLowerCase().startsWith(make.toLowerCase())
    ? model
    : `${make} ${model}`
}

const artworkItems: ArtworkItem[] = images.map((image, index) => {
  const date = getDateFromSource(image.src)

  return {
    id: `image-${index}-${image.src}`,
    shareId: `artwork-${date}-${index}`,
    kind: 'artwork',
    source: image.src,
    width: image.width,
    height: image.height,
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

const getLayoutPlacements = (
  group: { date: string; items: ArtItem[] },
  view: ArtView,
  manifest: ArtCuration
): LayoutPlacement[] => {
  const itemsById = new Map(group.items.map((item) => [item.id, item]))
  const configured = [...(manifest[view][group.date] ?? [])].sort(
    (first, second) =>
      first.y === second.y ? first.x - second.x : first.y - second.y
  )
  const configuredIds = new Set<string>()
  const placements: LayoutPlacement[] = []

  for (const entry of configured) {
    const item = itemsById.get(entry.id)
    if (!item || configuredIds.has(entry.id)) continue
    configuredIds.add(entry.id)
    placements.push({ item, layout: entry })
  }

  for (const item of group.items)
    if (!configuredIds.has(item.id))
      placements.push({
        item,
        layout: {
          id: item.id,
          x: 0,
          y: 0,
          w: 12,
          h: Math.max(4, Math.round(12 / item.ratio))
        }
      })

  return placements
}

const curationGroups: CurationGroup[] = timelineGroups.map((group) => ({
  date: group.date,
  items: group.items.map((item) => ({ id: item.id, ratio: item.ratio }))
}))

const getItemLabel = (item: ArtItem) => {
  if (item.kind === 'motion') return 'Motion'
  if (item.kind === 'photography') return 'Photography'
  return 'Artwork'
}

const getAccessibleItemLabel = (item: ArtItem) =>
  `${getItemLabel(item)} from ${item.dateLabel}`

const isLayoutMode = (value: string | null): value is LayoutMode =>
  value === 'big' || value === 'small'

function LayoutIcon({ mode }: { mode: LayoutMode }) {
  if (mode === 'big') {
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
        unoptimized
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

function LightboxMedia({
  autoPlay,
  item
}: {
  autoPlay: boolean
  item: ArtItem
}) {
  if (item.kind === 'artwork') {
    return (
      <Image
        src={item.source}
        alt={getAccessibleItemLabel(item)}
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

  if (item.kind === 'photography') {
    return (
      <Image
        src={item.source}
        alt={getAccessibleItemLabel(item)}
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
      autoPlay={autoPlay}
      playsInline
      aria-label={`${getAccessibleItemLabel(item)} video`}
    />
  )
}

export function ArtGallery() {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('big')
  const [curation, setCuration] = useState<ArtCuration>(() =>
    normalizeArtCuration(artCuration, curationGroups)
  )
  const [layoutReady, setLayoutReady] = useState(false)
  const [urlReady, setUrlReady] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [motionPreference, setMotionPreference] = useState<
    'unknown' | 'reduced' | 'full'
  >('unknown')
  const lightboxRef = useRef<HTMLDialogElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const openerRef = useRef<HTMLButtonElement | null>(null)
  const wasLightboxOpenRef = useRef(false)

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
      const storedLayout = window.localStorage.getItem(layoutStorageKey)
      if (isLayoutMode(storedLayout)) setLayoutMode(storedLayout)

      const storedCuration = window.localStorage.getItem(curationStorageKey)
      if (storedCuration) {
        const parsedCuration = JSON.parse(storedCuration) as ArtCuration
        if (parsedCuration && typeof parsedCuration === 'object')
          setCuration(normalizeArtCuration(parsedCuration, curationGroups))
      }
    } catch {
      // Local storage can be unavailable in private browsing contexts.
    }
    setLayoutReady(true)
  }, [])

  useEffect(() => {
    if (!layoutReady) return
    try {
      window.localStorage.setItem(layoutStorageKey, layoutMode)
      window.localStorage.setItem(curationStorageKey, JSON.stringify(curation))
    } catch {
      // Local storage can be unavailable in private browsing contexts.
    }
  }, [curation, layoutMode, layoutReady])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updateMotionPreference = () =>
      setMotionPreference(mediaQuery.matches ? 'reduced' : 'full')

    updateMotionPreference()
    mediaQuery.addEventListener('change', updateMotionPreference)

    return () =>
      mediaQuery.removeEventListener('change', updateMotionPreference)
  }, [])

  const moveLightbox = useCallback((direction: number) => {
    setLightboxIndex((currentIndex) => {
      if (currentIndex === null) return currentIndex
      return (currentIndex + direction + artItems.length) % artItems.length
    })
  }, [])

  useEffect(() => {
    if (lightboxIndex !== null) {
      wasLightboxOpenRef.current = true
      closeButtonRef.current?.focus()

      const previousBodyOverflow = document.body.style.overflow
      const previousDocumentOverflow = document.documentElement.style.overflow
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'

      return () => {
        document.body.style.overflow = previousBodyOverflow
        document.documentElement.style.overflow = previousDocumentOverflow
      }
    }

    if (wasLightboxOpenRef.current) {
      wasLightboxOpenRef.current = false
      openerRef.current?.focus()
      openerRef.current = null
    }
  }, [lightboxIndex])

  const openLightbox = (
    event: ReactMouseEvent<HTMLButtonElement>,
    index: number
  ) => {
    openerRef.current = event.currentTarget
    setLightboxIndex(index)
  }

  const handleLightboxKeyDown = (
    event: ReactKeyboardEvent<HTMLDialogElement>
  ) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      setLightboxIndex(null)
      return
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      moveLightbox(-1)
      return
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault()
      moveLightbox(1)
      return
    }

    if (event.key !== 'Tab') return

    const focusableElements = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        'button:not([disabled]), video[controls], [href], [tabindex]:not([tabindex="-1"])'
      )
    )
    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault()
      lastElement.focus()
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault()
      firstElement.focus()
    }
  }

  return (
    <div className='site-art'>
      <header className='site-art-toolbar'>
        <div>
          <p className='site-art-kicker'>Archive / Timeline</p>
          <h1>Art &amp; photography</h1>
        </div>
        <div className='site-art-layout-toggle' aria-label='Artwork layout'>
          {(['big', 'small'] as const).map((mode) => (
            <button
              key={mode}
              type='button'
              className={layoutMode === mode ? 'is-active' : ''}
              aria-label={`${mode} curated layout`}
              aria-pressed={layoutMode === mode}
              title={mode === 'small' ? 'Small' : 'Big'}
              onClick={() => setLayoutMode(mode)}>
              <LayoutIcon mode={mode} />
              <span>{mode === 'small' ? 'Small' : 'Big'}</span>
            </button>
          ))}
        </div>
      </header>

      <div className='site-art-timeline'>
        {timelineGroups.map((group) => (
          <section className='site-art-timeline-group' key={group.date}>
            <div className='site-art-timeline-date'>
              <time dateTime={group.date}>
                {group.items[0]?.dateLabel ?? formatDate(group.date, false)}
              </time>
            </div>
            <div className={`site-art-grid site-art-grid--${layoutMode}`}>
              {getLayoutPlacements(group, layoutMode, curation).map(
                (placement, index) => {
                  const item = placement.item
                  const itemIndex = artItems.indexOf(item)

                  return (
                    <button
                      key={item.id}
                      type='button'
                      className='site-art-card'
                      aria-label={`Open ${getItemLabel(item).toLowerCase()} from ${item.dateLabel}`}
                      style={
                        {
                          '--art-column': placement.layout.x + 1,
                          '--art-row': placement.layout.y + 1,
                          '--art-span': placement.layout.w,
                          '--art-height': placement.layout.h,
                          '--art-ratio': item.ratio
                        } as React.CSSProperties
                      }
                      onClick={(event) => openLightbox(event, itemIndex)}>
                      <span className='site-art-media'>
                        <ArtMedia
                          item={item}
                          sizes='(max-width: 479px) 92vw, (max-width: 900px) 75vw, 45vw'
                          priority={itemIndex < 4 || index < 2}
                        />
                      </span>
                    </button>
                  )
                }
              )}
            </div>
          </section>
        ))}
      </div>

      {lightboxItem ? (
        <dialog
          ref={lightboxRef}
          open
          className='site-art-lightbox'
          aria-labelledby='site-art-lightbox-title'
          aria-modal='true'
          onKeyDown={handleLightboxKeyDown}
          onClick={(event) => {
            if (event.target === event.currentTarget) setLightboxIndex(null)
          }}>
          <h2 id='site-art-lightbox-title' className='site-art-visually-hidden'>
            {getAccessibleItemLabel(lightboxItem)}
          </h2>
          <button
            ref={closeButtonRef}
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
            <LightboxMedia
              item={lightboxItem}
              autoPlay={motionPreference === 'full'}
            />
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
