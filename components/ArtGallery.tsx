import Image, { type StaticImageData } from 'next/image'
import { useCallback, useEffect, useState } from 'react'

import { images, videos } from '@/utils/arts'

type ImageItem = {
  id: string
  kind: 'image'
  source: StaticImageData
  ratio: number
}

type VideoItem = {
  id: string
  kind: 'video'
  source: string
  poster?: string
  ratio: number
}

type ArtItem = ImageItem | VideoItem
type ViewMode = 'thumbnails' | 'slideshow'

const artItems: ArtItem[] = [
  ...images.map(
    (image, index): ImageItem => ({
      id: `image-${index}-${image.src}`,
      kind: 'image',
      source: image,
      ratio: image.width / image.height
    })
  ),
  ...videos.map(
    ([source, poster], index): VideoItem => ({
      id: `video-${index}-${source}`,
      kind: 'video',
      source,
      poster,
      ratio: 16 / 9
    })
  )
]

const getItemSize = (ratio: number) => {
  if (ratio > 1.5) return 'wide'
  if (ratio < 0.8) return 'tall'
  return 'standard'
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
  if (item.kind === 'image') {
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

  return (
    <video
      src={item.source}
      poster={item.poster}
      muted
      playsInline
      preload='metadata'
    />
  )
}

function LightboxMedia({ item }: { item: ArtItem }) {
  if (item.kind === 'image') {
    return (
      <Image
        src={item.source}
        alt=''
        width={item.source.width}
        height={item.source.height}
        sizes='92vw'
        priority
        placeholder='blur'
        blurDataURL={item.source.blurDataURL}
      />
    )
  }

  return (
    // biome-ignore lint/a11y/useMediaCaption: Art videos are visual-only and contain no dialogue.
    <video
      src={item.source}
      poster={item.poster}
      controls
      autoPlay
      playsInline
    />
  )
}

export function ArtGallery() {
  const [view, setView] = useState<ViewMode>('thumbnails')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const selectedItem = artItems[selectedIndex]
  const lightboxItem = lightboxIndex === null ? null : artItems[lightboxIndex]

  const openLightbox = (index: number) => {
    setSelectedIndex(index)
    setLightboxIndex(index)
  }

  const moveLightbox = useCallback((direction: number) => {
    setLightboxIndex((currentIndex) => {
      if (currentIndex === null) return currentIndex
      return (currentIndex + direction + artItems.length) % artItems.length
    })
  }, [])

  useEffect(() => {
    if (lightboxIndex !== null) setSelectedIndex(lightboxIndex)
  }, [lightboxIndex])

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
      <div className='site-art-toolbar'>
        <div>
          <p className='site-art-kicker'>Archive</p>
          <h1>Art</h1>
        </div>
        <div className='site-art-view-switcher' aria-label='Art view'>
          <button
            type='button'
            className={view === 'thumbnails' ? 'is-active' : ''}
            aria-pressed={view === 'thumbnails'}
            onClick={() => setView('thumbnails')}>
            Thumbnails
          </button>
          <button
            type='button'
            className={view === 'slideshow' ? 'is-active' : ''}
            aria-pressed={view === 'slideshow'}
            onClick={() => setView('slideshow')}>
            Slideshow
          </button>
        </div>
      </div>

      {view === 'thumbnails' ? (
        <div className='site-art-grid'>
          {artItems.map((item, index) => (
            <button
              key={item.id}
              type='button'
              className='site-art-card'
              data-size={getItemSize(item.ratio)}
              onClick={() => openLightbox(index)}>
              <span
                className='site-art-media'
                style={{ aspectRatio: item.ratio }}>
                <ArtMedia
                  item={item}
                  sizes='(max-width: 700px) 92vw, (max-width: 1200px) 30vw, 22vw'
                  priority={index < 4}
                />
              </span>
              <span className='site-art-card-meta'>
                {item.kind === 'video' ? 'Motion' : 'Image'} ·{' '}
                {String(index + 1).padStart(2, '0')}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <section className='site-art-slideshow' aria-label='Art slideshow'>
          <button
            type='button'
            className='site-art-slide-arrow'
            aria-label='Previous artwork'
            onClick={() => {
              setSelectedIndex(
                (selectedIndex - 1 + artItems.length) % artItems.length
              )
            }}>
            ←
          </button>
          <button
            type='button'
            className='site-art-slide'
            onClick={() => openLightbox(selectedIndex)}>
            <span className='site-art-media'>
              <ArtMedia
                item={selectedItem}
                sizes='(max-width: 700px) 86vw, 65vw'
                priority
              />
            </span>
            <span className='site-art-card-meta'>
              {selectedItem.kind === 'video' ? 'Motion' : 'Image'} ·{' '}
              {String(selectedIndex + 1).padStart(2, '0')} /{' '}
              {String(artItems.length).padStart(2, '0')}
            </span>
          </button>
          <button
            type='button'
            className='site-art-slide-arrow'
            aria-label='Next artwork'
            onClick={() => {
              setSelectedIndex((selectedIndex + 1) % artItems.length)
            }}>
            →
          </button>
          <div className='site-art-filmstrip'>
            {artItems.map((item, index) => (
              <button
                key={item.id}
                type='button'
                className={index === selectedIndex ? 'is-active' : ''}
                aria-label={`Show artwork ${index + 1}`}
                onClick={() => setSelectedIndex(index)}>
                <span className='site-art-media'>
                  <ArtMedia item={item} sizes='72px' />
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {lightboxItem ? (
        <dialog
          open
          className='site-art-lightbox'
          aria-label='Full screen artwork'>
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
          <div className='site-art-lightbox-content'>
            <LightboxMedia item={lightboxItem} />
            <p>
              {(lightboxIndex ?? 0) + 1} / {artItems.length}
            </p>
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
