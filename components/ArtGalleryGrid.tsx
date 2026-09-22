import Image from 'next/image'
import {
  type CSSProperties,
  type MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'

import { photography } from '@/data/photography'
import { images, videos } from '@/utils/arts'

type GalleryImage = {
  alt: string
  height: number
  id: string
  kind: 'image'
  shareId: string
  src: string
  timelineKey: string
  dateLabel: string
  width: number
}

type GalleryVideo = {
  alt: string
  height: number
  id: string
  kind: 'video'
  poster: string
  ratio: number
  shareId: string
  src: string
  timelineKey: string
  dateLabel: string
  width: number
}

type GalleryItem = GalleryImage | GalleryVideo
type GalleryGroup = { key: string; label: string; items: GalleryItem[] }

const sourceDatePattern = /(\d{4}-\d{2}-\d{2})/

const formatMonthYear = (date: string) => {
  const normalizedDate = date.length === 7 ? `${date}-01` : date

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    timeZone: 'UTC',
    year: 'numeric'
  }).format(new Date(`${normalizedDate}T00:00:00Z`))
}

const getSourceTimeline = (source: string) => {
  const date = source.match(sourceDatePattern)?.[1] ?? '1970-01-01'

  return {
    date,
    dateLabel: formatMonthYear(date),
    timelineKey: date.slice(0, 7)
  }
}

const getCapturedTimeline = (capturedDate: string) => ({
  dateLabel: formatMonthYear(capturedDate),
  timelineKey: capturedDate.slice(0, 7)
})

const galleryItems: GalleryItem[] = [
  ...photography.map(
    (photo): GalleryImage => ({
      ...getCapturedTimeline(photo.capturedDate),
      alt: `Photography ${photo.id}`,
      height: photo.height,
      id: `photography-${photo.id}`,
      kind: 'image',
      shareId: `photography-${photo.id}`,
      src: photo.url,
      width: photo.width
    })
  ),
  ...images.map((image, index): GalleryImage => {
    const { date, ...timeline } = getSourceTimeline(image.src)

    return {
      ...timeline,
      alt: `Artwork ${index + 1}`,
      height: image.height,
      id: `artwork-${index + 1}`,
      kind: 'image',
      shareId: `artwork-${date}-${index}`,
      src: image.src,
      width: image.width
    }
  }),
  ...videos.map(([src, poster, ratio], index): GalleryVideo => {
    const { date, ...timeline } = getSourceTimeline(src)

    return {
      ...timeline,
      alt: `Motion artwork ${index + 1}`,
      height: Math.round(1600 / ratio),
      id: `motion-${index + 1}`,
      kind: 'video',
      poster,
      ratio,
      shareId: `motion-${date}-${index}`,
      src,
      width: 1600
    }
  })
].sort((left, right) => right.timelineKey.localeCompare(left.timelineKey))

const galleryGroups = galleryItems.reduce<GalleryGroup[]>((groups, item) => {
  const group = groups.find(({ key }) => key === item.timelineKey)

  if (group) {
    group.items.push(item)
  } else {
    groups.push({ key: item.timelineKey, label: item.dateLabel, items: [item] })
  }

  return groups
}, [])

const doubleWidthShareIds = new Set([
  'photography-IMG_3498',
  'photography-DSCF6057',
  'photography-DSCF2181-2',
  'photography-DSCF2217',
  'photography-DSCF1911',
  'photography-DSCF1549',
  'photography-DSCF1800-copy',
  'photography-DSCF1637',
  'photography-DSCF1355',
  'photography-DSCF1400',
  'photography-DSCF1368',
  'photography-DSCF1217',
  'photography-DSCF0639',
  'photography-DSCF1716-1',
  'photography-DSCF1551',
  'photography-DSCF1517',
  'photography-DSCF2189-1',
  'photography-DSCF1890',
  'artwork-2017-05-23-21',
  'artwork-2017-06-03-19',
  'artwork-2017-06-03-20',
  'photography-DSCF1545'
])

const isDoubleWidthItem = (item: GalleryItem) =>
  doubleWidthShareIds.has(item.shareId)

const focusRingClassName =
  'focus-visible:outline-2 focus-visible:outline-[color:var(--page-highlight)] focus-visible:outline-offset-3'

function GalleryLightbox({
  item,
  onClose,
  onMove
}: {
  item: GalleryItem
  onClose: () => void
  onMove: (direction: number) => void
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeButtonRef.current?.focus()
  }, [])

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: Backdrop click dismissal has equivalent Escape and close-button controls.
    <div
      className='fixed inset-0 z-[100] grid h-screen w-full grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-2 overflow-hidden bg-black p-3 sm:grid-cols-[48px_minmax(0,1fr)_48px] sm:gap-5 sm:p-8'
      role='dialog'
      aria-modal='true'
      aria-labelledby='art-lightbox-title'
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}>
      <h2 id='art-lightbox-title' className='sr-only'>
        {item.alt}
      </h2>
      <button
        ref={closeButtonRef}
        type='button'
        className={`absolute right-7 top-6 z-10 grid h-11 w-11 place-items-center border-0 bg-transparent text-3xl leading-none text-white hover:text-[color:var(--page-highlight)] ${focusRingClassName}`}
        aria-label='Close fullscreen artwork'
        onClick={onClose}>
        ×
      </button>
      <button
        type='button'
        className={`grid h-11 w-11 place-items-center border-0 bg-transparent text-3xl leading-none text-white hover:text-[color:var(--page-highlight)] ${focusRingClassName}`}
        aria-label='Previous artwork'
        onClick={() => onMove(-1)}>
        ←
      </button>
      <div className='flex min-h-0 min-w-0 max-h-full max-w-full items-center justify-center'>
        {item.kind === 'video' ? (
          <video
            className='block max-h-[calc(100vh-96px)] max-w-full object-contain'
            src={item.src}
            poster={item.poster}
            controls
            autoPlay
            muted
            playsInline
            aria-label={item.alt}
            style={{ aspectRatio: item.ratio } as CSSProperties}
          />
        ) : (
          <Image
            className={`block h-auto max-h-[calc(100vh-96px)] w-auto max-w-full object-contain ${item.width > item.height ? 'min-w-[min(60vw,960px)] max-[767px]:min-w-0' : ''}`}
            src={item.src}
            alt={item.alt}
            width={item.width}
            height={item.height}
            sizes='92vw'
            priority
            unoptimized
          />
        )}
      </div>
      <button
        type='button'
        className={`grid h-11 w-11 place-items-center border-0 bg-transparent text-3xl leading-none text-white hover:text-[color:var(--page-highlight)] ${focusRingClassName}`}
        aria-label='Next artwork'
        onClick={() => onMove(1)}>
        →
      </button>
    </div>
  )
}

export function ArtGalleryGrid() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [urlReady, setUrlReady] = useState(false)
  const openerRef = useRef<HTMLButtonElement | null>(null)
  const wasOpenRef = useRef(false)

  const moveLightbox = useCallback((direction: number) => {
    setLightboxIndex((currentIndex) => {
      if (currentIndex === null) return currentIndex
      return (
        (currentIndex + direction + galleryItems.length) % galleryItems.length
      )
    })
  }, [])

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null)
  }, [])

  useEffect(() => {
    const readItemFromUrl = () => {
      const shareId = new URLSearchParams(window.location.search).get('item')
      const nextIndex = galleryItems.findIndex(
        (item) => item.shareId === shareId
      )

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
      url.searchParams.set('item', galleryItems[lightboxIndex].shareId)
    }

    window.history.replaceState(
      null,
      '',
      `${url.pathname}${url.search}${url.hash}`
    )
  }, [lightboxIndex, urlReady])

  useEffect(() => {
    if (lightboxIndex === null) {
      if (wasOpenRef.current) {
        openerRef.current?.focus()
        openerRef.current = null
        wasOpenRef.current = false
      }
      return
    }

    wasOpenRef.current = true
    const previousBodyOverflow = document.body.style.overflow
    const previousDocumentOverflow = document.documentElement.style.overflow

    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeLightbox()
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        moveLightbox(-1)
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        moveLightbox(1)
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousBodyOverflow
      document.documentElement.style.overflow = previousDocumentOverflow
    }
  }, [closeLightbox, lightboxIndex, moveLightbox])

  const openLightbox = (
    event: MouseEvent<HTMLButtonElement>,
    index: number
  ) => {
    openerRef.current = event.currentTarget
    setLightboxIndex(index)
  }

  const activeItem = lightboxIndex === null ? null : galleryItems[lightboxIndex]

  const renderGalleryItem = (item: GalleryItem) => {
    const index = galleryItems.indexOf(item)

    return (
      <figure
        className={`relative m-0 min-w-0 overflow-hidden bg-[color-mix(in_srgb,var(--page-text)_8%,var(--page-background))] ${isDoubleWidthItem(item) ? 'site-art-masonry-wide' : ''}`}
        key={item.id}>
        {item.kind === 'video' ? (
          <>
            {/* biome-ignore lint/a11y/useMediaCaption: These art videos are visual-only and contain no dialogue. */}
            <video
              className='block h-auto w-full object-cover [aspect-ratio:var(--art-video-ratio)]'
              src={item.src}
              poster={item.poster}
              controls
              playsInline
              preload='none'
              aria-label={item.alt}
              style={
                {
                  '--art-video-ratio': item.ratio
                } as CSSProperties
              }
            />
            <button
              type='button'
              className={`absolute right-3 top-3 grid h-10 w-10 place-items-center border border-white/70 bg-black/55 text-xl leading-none text-white backdrop-blur-sm hover:bg-black/80 ${focusRingClassName}`}
              aria-label={`Open ${item.alt} fullscreen`}
              onClick={(event) => openLightbox(event, index)}>
              ⛶
            </button>
          </>
        ) : (
          <button
            type='button'
            className={`group block w-full cursor-zoom-in border-0 bg-transparent p-0 text-left ${focusRingClassName}`}
            aria-label={`Open ${item.alt} fullscreen`}
            onClick={(event) => openLightbox(event, index)}>
            <Image
              className='block h-auto w-full transition-transform duration-300 group-hover:scale-[1.015]'
              src={item.src}
              alt={item.alt}
              width={item.width}
              height={item.height}
              sizes='(max-width: 767px) 100vw, (max-width: 1200px) 33vw, 25vw'
              priority={index < 2}
              loading={index < 2 ? 'eager' : 'lazy'}
              unoptimized
            />
          </button>
        )}
      </figure>
    )
  }

  return (
    <>
      <section
        className='box-border min-h-screen ml-[max(150px,calc(8vw+120px))] bg-[color:var(--page-background)] pb-[10vw] pl-0 pr-[6vw] pt-[8vw] text-[color:var(--page-text)] max-lg:ml-0 max-lg:px-5 max-lg:pb-20 max-lg:pt-[106px]'
        aria-labelledby='art-title'>
        <header className='mb-[clamp(36px,6vw,72px)]'>
          <h1
            id='art-title'
            className='m-0 font-serif text-[clamp(32px,4vw,52px)] font-normal leading-[1.2]'>
            Art &amp; Photography
          </h1>
        </header>

        <div>
          <div className='grid gap-[clamp(64px,9vw,132px)]'>
            {galleryGroups.map((group) => (
              <section key={group.key} className='relative'>
                <div className='mb-4 flex items-baseline gap-x-3.5'>
                  <time
                    className='font-display text-sm leading-[1.3] text-[color:var(--page-text)]'
                    dateTime={`${group.key}-01`}>
                    {group.label}
                  </time>
                </div>

                <div className='site-art-masonry'>
                  {group.items.map(renderGalleryItem)}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>

      {activeItem ? (
        <GalleryLightbox
          item={activeItem}
          onClose={closeLightbox}
          onMove={moveLightbox}
        />
      ) : null}
    </>
  )
}
