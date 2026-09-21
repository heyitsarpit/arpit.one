import Image from 'next/image'
import {
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'

import {
  ART_GRID_COLUMNS,
  type ArtCuration,
  type ArtView,
  type CurationGroup,
  type InnerPadding,
  type LayoutItem,
  type MediaPosition,
  createDefaultLayout,
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
type LayoutMode = ArtView
const layoutStorageKey = 'art-layout-mode-v8'
const curationStorageKey = 'art-curation-v8'
const editorZoomStorageKey = 'art-editor-zoom-v1'
const editorZoomSteps = [0.25, 0.35, 0.5, 0.75, 1, 1.25, 1.5, 2]
const editorPaddingSteps = [0, 4, 8, 12, 16, 24, 32, 48]
const artGridColumns = Array.from(
  { length: ART_GRID_COLUMNS },
  (_, index) => index + 1
)
const gridRulerLabels = Array.from(
  { length: 10 },
  (_, index) => (index + 1) * 10
)
const mediaPositions: Array<{ label: string; value: MediaPosition }> = [
  { label: 'Center', value: 'center' },
  { label: 'Up', value: 'top' },
  { label: 'Down', value: 'bottom' },
  { label: 'Left', value: 'left' },
  { label: 'Right', value: 'right' }
]
const paddingSides: Array<{ label: string; side: keyof InnerPadding }> = [
  { label: 'Left', side: 'left' },
  { label: 'Right', side: 'right' },
  { label: 'Up', side: 'top' },
  { label: 'Down', side: 'bottom' }
]

const getObjectPosition = (position: MediaPosition = 'center') => {
  if (position === 'top') return 'center top'
  if (position === 'bottom') return 'center bottom'
  if (position === 'left') return 'left center'
  if (position === 'right') return 'right center'
  return 'center center'
}

type ResizeCorner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

const resizeCorners: Array<{ className: string; value: ResizeCorner }> = [
  { className: 'top-left', value: 'top-left' },
  { className: 'top-right', value: 'top-right' },
  { className: 'bottom-left', value: 'bottom-left' },
  { className: 'bottom-right', value: 'bottom-right' }
]

type LayoutInteraction = {
  action: 'move' | 'resize'
  date: string
  id: string
  metrics: {
    columnStep: number
    rowStep: number
  }
  mode: LayoutMode
  pointerId: number
  resizeCorner?: ResizeCorner
  startLayout: LayoutItem
  startX: number
  startY: number
}

type LayoutTarget = {
  date: string
  id: string
  mode: LayoutMode
}

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

const curationGroups: CurationGroup[] = timelineGroups.map((group) => ({
  date: group.date,
  items: group.items.map((item) => ({ id: item.id, ratio: item.ratio }))
}))

const imageFirstArtCuration: ArtCuration = {
  big: Object.fromEntries(
    curationGroups.map((group) => [
      group.date,
      createDefaultLayout(group.items, 'big')
    ])
  ),
  small: Object.fromEntries(
    curationGroups.map((group) => [
      group.date,
      createDefaultLayout(group.items, 'small')
    ])
  )
}

type GlobalArtCuration = Record<ArtView, LayoutItem[]>

type GlobalLayoutPlacement = {
  date: string
  item: ArtItem
  layout: LayoutItem
}

type GlobalDateAnchor = {
  date: string
  label: string
  column: number
  height: number
  row: number
  span: number
}

type AlignmentGuide = {
  axis: 'horizontal' | 'vertical'
  position: number
  span: number
  start: number
}

const globalGroupGap = 10
const dateAnchorWidth = 30
const dateAnchorHeight = 2

const buildGlobalArtCuration = (source: ArtCuration): GlobalArtCuration => {
  const normalized = normalizeArtCuration(source, curationGroups)

  return Object.fromEntries(
    (['big', 'small'] as const).map((view) => {
      let groupOffset = 0
      const layouts: LayoutItem[] = []

      for (const group of timelineGroups) {
        const groupLayouts = normalized[view][group.date] ?? []
        layouts.push(
          ...groupLayouts.map((layout) => ({
            ...layout,
            y: layout.y + groupOffset
          }))
        )

        const groupBottom = groupLayouts.reduce(
          (bottom, layout) => Math.max(bottom, layout.y + layout.h),
          0
        )
        groupOffset += groupBottom + globalGroupGap
      }

      return [view, layouts]
    })
  ) as GlobalArtCuration
}

const isGlobalArtCuration = (value: unknown): value is GlobalArtCuration => {
  if (!value || typeof value !== 'object') return false

  const candidate = value as Partial<GlobalArtCuration>
  return Array.isArray(candidate.big) && Array.isArray(candidate.small)
}

const normalizeGlobalArtCuration = (
  candidate: GlobalArtCuration
): GlobalArtCuration => {
  const fallback = buildGlobalArtCuration(imageFirstArtCuration)

  return Object.fromEntries(
    (['big', 'small'] as const).map((view) => {
      const fallbackById = new Map(
        fallback[view].map((layout) => [layout.id, layout])
      )
      const seen = new Set<string>()
      const configured = candidate[view]
        .filter((layout) => fallbackById.has(layout.id) && !seen.has(layout.id))
        .map((layout) => {
          seen.add(layout.id)
          const width = clamp(layout.w, 2, ART_GRID_COLUMNS)

          return {
            ...fallbackById.get(layout.id),
            ...layout,
            h: Math.max(8, layout.h),
            w: width,
            x: clamp(layout.x, 0, ART_GRID_COLUMNS - width),
            y: Math.max(0, layout.y)
          }
        })
      const configuredBottom = configured.reduce(
        (bottom, layout) => Math.max(bottom, layout.y + layout.h),
        0
      )
      const missing = fallback[view]
        .filter((layout) => !seen.has(layout.id))
        .map((layout, index) => ({
          ...layout,
          y: configuredBottom + globalGroupGap + index * (layout.h + 1)
        }))

      return [view, [...configured, ...missing]]
    })
  ) as GlobalArtCuration
}

const getGlobalLayoutPlacements = (
  view: ArtView,
  globalCuration: GlobalArtCuration
): GlobalLayoutPlacement[] => {
  const itemsById = new Map(artItems.map((item) => [item.id, item]))
  const dateById = new Map(
    timelineGroups.flatMap((group) =>
      group.items.map((item) => [item.id, group.date] as const)
    )
  )

  return globalCuration[view]
    .map((layout) => {
      const item = itemsById.get(layout.id)
      const date = dateById.get(layout.id)

      return item && date ? { date, item, layout } : null
    })
    .filter(
      (placement): placement is GlobalLayoutPlacement => placement !== null
    )
    .sort((first, second) =>
      first.layout.y === second.layout.y
        ? first.layout.x - second.layout.x
        : first.layout.y - second.layout.y
    )
}

const getGlobalDateAnchors = (
  view: ArtView,
  globalCuration: GlobalArtCuration
): GlobalDateAnchor[] => {
  const placements = getGlobalLayoutPlacements(view, globalCuration)
  const occupied = placements.map(({ layout }) => layout)

  const findEmptyDateSlot = (targetRow: number) => {
    const maxOccupiedBottom = Math.max(
      0,
      ...occupied.map((layout) => layout.y + layout.h)
    )
    const rowCandidates = new Set<number>([
      targetRow,
      0,
      maxOccupiedBottom + 1,
      ...Array.from({ length: 49 }, (_, index) => targetRow - index),
      ...Array.from({ length: 49 }, (_, index) => targetRow + index),
      ...occupied.flatMap((layout) => [
        layout.y - dateAnchorHeight,
        layout.y + layout.h
      ])
    ])
    const rows = Array.from(rowCandidates)
      .filter((row) => row >= 0)
      .sort(
        (first, second) =>
          Math.abs(first - targetRow) - Math.abs(second - targetRow) ||
          first - second
      )

    for (const row of rows) {
      for (
        let column = 0;
        column <= ART_GRID_COLUMNS - dateAnchorWidth;
        column += 1
      ) {
        const candidate = {
          x: column,
          y: row,
          w: dateAnchorWidth,
          h: dateAnchorHeight
        }
        if (!occupied.some((layout) => layoutsOverlap(candidate, layout)))
          return { column, row }
      }
    }

    return { column: 0, row: Math.max(targetRow, 0) }
  }

  return timelineGroups.flatMap((group) => {
    const groupPlacements = placements.filter(
      (placement) => placement.date === group.date
    )
    if (groupPlacements.length === 0) return []

    const targetRow = Math.min(...groupPlacements.map(({ layout }) => layout.y))
    const slot = findEmptyDateSlot(targetRow)
    occupied.push({
      x: slot.column,
      y: slot.row,
      w: dateAnchorWidth,
      h: dateAnchorHeight,
      id: `date-${group.date}`
    })

    return [
      {
        date: group.date,
        label: group.items[0]?.dateLabel ?? formatDate(group.date, false),
        column: slot.column + 1,
        height: dateAnchorHeight,
        row: slot.row + 1,
        span: dateAnchorWidth
      }
    ]
  })
}

const getItemLabel = (item: ArtItem) => {
  if (item.kind === 'motion') return 'Motion'
  if (item.kind === 'photography') return 'Photography'
  return 'Artwork'
}

const getAccessibleItemLabel = (item: ArtItem) =>
  `${getItemLabel(item)} from ${item.dateLabel}`

const isLayoutMode = (value: string | null): value is LayoutMode =>
  value === 'big' || value === 'small'

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(Math.max(value, minimum), maximum)

const getInnerPadding = (
  padding: InnerPadding | undefined,
  side: keyof InnerPadding
) => {
  const value = padding?.[side] ?? 0
  return clamp(Number.isFinite(value) ? value : 0, 0, 48)
}

const layoutsOverlap = (
  first: Pick<LayoutItem, 'x' | 'y' | 'w' | 'h'>,
  second: Pick<LayoutItem, 'x' | 'y' | 'w' | 'h'>
) =>
  first.x < second.x + second.w &&
  first.x + first.w > second.x &&
  first.y < second.y + second.h &&
  first.y + first.h > second.y

const getAlignmentGuides = (
  active: LayoutItem,
  layouts: LayoutItem[]
): AlignmentGuide[] => {
  const vertical = new Map<number, { end: number; start: number }>()
  const horizontal = new Map<number, { end: number; start: number }>()
  const activeVertical = [
    active.x,
    active.x + active.w,
    Math.round(active.x + active.w / 2)
  ]
  const activeHorizontal = [
    active.y,
    active.y + active.h,
    Math.round(active.y + active.h / 2)
  ]

  const addGuide = (
    collection: Map<number, { end: number; start: number }>,
    position: number,
    start: number,
    end: number
  ) => {
    const existing = collection.get(position)
    collection.set(position, {
      end: Math.max(existing?.end ?? end, end),
      start: Math.min(existing?.start ?? start, start)
    })
  }

  for (const layout of layouts) {
    if (layout.id === active.id) continue

    const otherVertical = [
      layout.x,
      layout.x + layout.w,
      Math.round(layout.x + layout.w / 2)
    ]
    const otherHorizontal = [
      layout.y,
      layout.y + layout.h,
      Math.round(layout.y + layout.h / 2)
    ]

    for (const position of activeVertical) {
      if (!otherVertical.some((line) => line === position)) continue
      addGuide(
        vertical,
        position,
        Math.min(active.y, layout.y),
        Math.max(active.y + active.h, layout.y + layout.h)
      )
    }

    for (const position of activeHorizontal) {
      if (!otherHorizontal.some((line) => line === position)) continue
      addGuide(
        horizontal,
        position,
        Math.min(active.x, layout.x),
        Math.max(active.x + active.w, layout.x + layout.w)
      )
    }
  }

  return [
    ...Array.from(vertical, ([position, range]) => ({
      axis: 'vertical' as const,
      position,
      span: range.end - range.start,
      start: range.start
    })),
    ...Array.from(horizontal, ([position, range]) => ({
      axis: 'horizontal' as const,
      position,
      span: range.end - range.start,
      start: range.start
    }))
  ]
}

const placeLayoutAndPushDown = (
  candidate: LayoutItem,
  layouts: LayoutItem[]
): LayoutItem[] => {
  const nextLayouts = layouts.map((layout) =>
    layout.id === candidate.id ? candidate : { ...layout }
  )
  const pendingPushes = [candidate.id]

  while (pendingPushes.length > 0) {
    const pusherId = pendingPushes.shift()
    if (!pusherId) continue

    const pusher = nextLayouts.find((layout) => layout.id === pusherId)
    if (!pusher) continue

    for (let index = 0; index < nextLayouts.length; index += 1) {
      const layout = nextLayouts[index]
      if (layout.id === pusher.id || !layoutsOverlap(pusher, layout)) continue

      const pushed = {
        ...layout,
        y: Math.max(layout.y, pusher.y + pusher.h)
      }
      if (pushed.y === layout.y) continue

      nextLayouts[index] = pushed
      pendingPushes.push(layout.id)
    }
  }

  return nextLayouts
}

const resizeLayoutWithoutOverlap = (
  candidate: LayoutItem,
  layouts: LayoutItem[]
): LayoutItem => {
  let next = candidate
  const otherLayouts = layouts.filter((layout) => layout.id !== candidate.id)

  for (let attempt = 0; attempt < otherLayouts.length + 1; attempt += 1) {
    const blocking = otherLayouts.find((layout) => layoutsOverlap(next, layout))
    if (!blocking) return next

    const width = blocking.x > candidate.x ? blocking.x - candidate.x : 0
    const height = blocking.y > candidate.y ? blocking.y - candidate.y : 0
    const canUseWidth = width >= 2
    const canUseHeight = height >= 2

    if (!canUseWidth && !canUseHeight) return { ...next, w: 2, h: 2 }

    if (canUseWidth && canUseHeight) {
      next =
        width * next.h >= height * next.w
          ? { ...next, w: width }
          : { ...next, h: height }
    } else if (canUseWidth) {
      next = { ...next, w: width }
    } else {
      next = { ...next, h: height }
    }
  }

  return next
}

const getGridMetrics = (grid: HTMLElement, zoom: number) => {
  const styles = window.getComputedStyle(grid)
  const columnGap = Number.parseFloat(styles.columnGap) || 0
  const rowGap = Number.parseFloat(styles.rowGap) || 0
  const rowHeight = Number.parseFloat(styles.gridAutoRows) || 32
  const columnWidth =
    (grid.clientWidth - columnGap * (ART_GRID_COLUMNS - 1)) / ART_GRID_COLUMNS

  return {
    columnGap: columnGap * zoom,
    columnSize: columnWidth * zoom,
    columnStep: (columnWidth + columnGap) * zoom,
    rowGap: rowGap * zoom,
    rowSize: rowHeight * zoom,
    rowStep: (rowHeight + rowGap) * zoom
  }
}

const getGridSpanSize = (count: number, size: number, gap: number) =>
  count * size + Math.max(0, count - 1) * gap

const getClosestGridSpan = (
  targetSize: number,
  size: number,
  gap: number,
  maximum: number
) => {
  let closest = 2
  let closestDifference = Number.POSITIVE_INFINITY

  for (let count = 2; count <= maximum; count += 1) {
    const difference = Math.abs(getGridSpanSize(count, size, gap) - targetSize)
    if (difference < closestDifference) {
      closest = count
      closestDifference = difference
    }
  }

  return closest
}

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
  const [curation, setCuration] = useState<GlobalArtCuration>(() =>
    buildGlobalArtCuration(imageFirstArtCuration)
  )
  const [editMode, setEditMode] = useState(false)
  const [editorZoom, setEditorZoom] = useState(1)
  const [layoutReady, setLayoutReady] = useState(false)
  const [urlReady, setUrlReady] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [layoutInteraction, setLayoutInteraction] =
    useState<LayoutInteraction | null>(null)
  const [selectedLayout, setSelectedLayout] = useState<LayoutTarget | null>(
    null
  )
  const [timelineViewportHeight, setTimelineViewportHeight] = useState<
    number | null
  >(null)
  const [motionPreference, setMotionPreference] = useState<
    'unknown' | 'reduced' | 'full'
  >('unknown')
  const lightboxRef = useRef<HTMLDialogElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const openerRef = useRef<HTMLButtonElement | null>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const wasLightboxOpenRef = useRef(false)

  const lightboxItem = lightboxIndex === null ? null : artItems[lightboxIndex]
  const selectedLayoutItem = selectedLayout
    ? curation[selectedLayout.mode].find(
        (layout) => layout.id === selectedLayout.id
      )
    : undefined
  const selectedArtItem = selectedLayout
    ? artItems.find((item) => item.id === selectedLayout.id)
    : undefined

  useEffect(() => {
    const readItemFromUrl = () => {
      const params = new URLSearchParams(window.location.search)
      setEditMode(params.get('edit') === '1')

      const shareId = params.get('item')
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

      const storedEditorZoom = Number(
        window.localStorage.getItem(editorZoomStorageKey)
      )
      if (editorZoomSteps.includes(storedEditorZoom))
        setEditorZoom(storedEditorZoom)

      const storedCuration = window.localStorage.getItem(curationStorageKey)
      if (storedCuration) {
        const parsedCuration = JSON.parse(storedCuration) as unknown
        if (isGlobalArtCuration(parsedCuration))
          setCuration(normalizeGlobalArtCuration(parsedCuration))
        else if (parsedCuration && typeof parsedCuration === 'object')
          setCuration(buildGlobalArtCuration(parsedCuration as ArtCuration))
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
      window.localStorage.setItem(editorZoomStorageKey, String(editorZoom))
    } catch {
      // Local storage can be unavailable in private browsing contexts.
    }
  }, [curation, editorZoom, layoutMode, layoutReady])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updateMotionPreference = () =>
      setMotionPreference(mediaQuery.matches ? 'reduced' : 'full')

    updateMotionPreference()
    mediaQuery.addEventListener('change', updateMotionPreference)

    return () =>
      mediaQuery.removeEventListener('change', updateMotionPreference)
  }, [])

  useEffect(() => {
    if (!editMode) {
      setTimelineViewportHeight(null)
      return
    }

    const timeline = timelineRef.current
    if (!timeline) return

    const updateTimelineViewportHeight = () => {
      setTimelineViewportHeight(timeline.scrollHeight * editorZoom)
    }

    updateTimelineViewportHeight()
    const observer = new ResizeObserver(updateTimelineViewportHeight)
    observer.observe(timeline)

    return () => observer.disconnect()
  }, [editMode, editorZoom])

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

  const setEditorMode = (enabled: boolean) => {
    setEditMode(enabled)
    setLayoutInteraction(null)

    const url = new URL(window.location.href)
    if (enabled) url.searchParams.set('edit', '1')
    else url.searchParams.delete('edit')

    window.history.replaceState(
      null,
      '',
      `${url.pathname}${url.search}${url.hash}`
    )
  }

  const startLayoutInteraction = (
    event: ReactPointerEvent<HTMLElement>,
    mode: LayoutMode,
    date: string,
    layout: LayoutItem,
    action: LayoutInteraction['action'],
    resizeCorner?: ResizeCorner
  ) => {
    if (!editMode) return

    const grid = event.currentTarget.closest<HTMLElement>('.site-art-grid')
    if (!grid) return

    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    setSelectedLayout({ date, id: layout.id, mode })

    setLayoutInteraction({
      action,
      date,
      id: layout.id,
      metrics: getGridMetrics(grid, editorZoom),
      mode,
      pointerId: event.pointerId,
      resizeCorner,
      startLayout: layout,
      startX: event.clientX,
      startY: event.clientY
    })
  }

  const updateLayoutInteraction = (event: ReactPointerEvent<HTMLElement>) => {
    if (!layoutInteraction || event.pointerId !== layoutInteraction.pointerId)
      return

    const deltaX = Math.round(
      (event.clientX - layoutInteraction.startX) /
        layoutInteraction.metrics.columnStep
    )
    const deltaY = Math.round(
      (event.clientY - layoutInteraction.startY) /
        layoutInteraction.metrics.rowStep
    )
    const startLayout = layoutInteraction.startLayout

    setCuration((current) => {
      const layouts = current[layoutInteraction.mode]
      const currentLayout = layouts.find(
        (layout) => layout.id === layoutInteraction.id
      )
      if (!currentLayout) return current

      if (layoutInteraction.action === 'resize') {
        const corner = layoutInteraction.resizeCorner ?? 'bottom-right'
        const rightEdge = startLayout.x + startLayout.w
        const bottomEdge = startLayout.y + startLayout.h
        const x = corner.includes('left')
          ? clamp(startLayout.x + deltaX, 0, rightEdge - 2)
          : startLayout.x
        const y = corner.includes('top')
          ? clamp(startLayout.y + deltaY, 0, bottomEdge - 2)
          : startLayout.y
        const resized = {
          ...currentLayout,
          h: corner.includes('top')
            ? bottomEdge - y
            : Math.max(2, startLayout.h + deltaY),
          w: corner.includes('left')
            ? rightEdge - x
            : clamp(
                startLayout.w + deltaX,
                2,
                ART_GRID_COLUMNS - startLayout.x
              ),
          x,
          y
        }

        return {
          ...current,
          [layoutInteraction.mode]: layouts.map((layout) =>
            layout.id === layoutInteraction.id
              ? resizeLayoutWithoutOverlap(resized, layouts)
              : layout
          )
        }
      }

      const moved = {
        ...currentLayout,
        x: clamp(startLayout.x + deltaX, 0, ART_GRID_COLUMNS - startLayout.w),
        y: Math.max(0, startLayout.y + deltaY)
      }

      return {
        ...current,
        [layoutInteraction.mode]: placeLayoutAndPushDown(moved, layouts)
      }
    })
  }

  const finishLayoutInteraction = (event: ReactPointerEvent<HTMLElement>) => {
    if (!layoutInteraction || event.pointerId !== layoutInteraction.pointerId)
      return

    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId)
    setLayoutInteraction(null)
  }

  const handleEditorKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    mode: LayoutMode,
    layout: LayoutItem
  ) => {
    if (!editMode) return

    const movement = {
      ArrowDown: [0, 1],
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1]
    }[event.key]
    if (!movement) return

    event.preventDefault()
    setCuration((current) => ({
      ...current,
      [mode]: placeLayoutAndPushDown(
        {
          ...layout,
          x: clamp(layout.x + movement[0], 0, ART_GRID_COLUMNS - layout.w),
          y: Math.max(0, layout.y + movement[1])
        },
        current[mode]
      )
    }))
  }

  const resetCurrentLayout = () => {
    const defaults = buildGlobalArtCuration(imageFirstArtCuration)
    setCuration((current) => ({
      ...current,
      [layoutMode]: defaults[layoutMode]
    }))
    setSelectedLayout(null)
  }

  const setSelectedImagePosition = (position: MediaPosition) => {
    if (!selectedLayoutItem || !selectedLayout) return

    setCuration((current) => ({
      ...current,
      [selectedLayout.mode]: current[selectedLayout.mode].map((layout) =>
        layout.id === selectedLayout.id
          ? { ...layout, objectPosition: position }
          : layout
      )
    }))
  }

  const moveSelectedImage = (deltaX: number, deltaY: number) => {
    if (!selectedLayout) return

    setCuration((current) => {
      const layouts = current[selectedLayout.mode]
      const selected = layouts.find((layout) => layout.id === selectedLayout.id)
      if (!selected) return current

      return {
        ...current,
        [selectedLayout.mode]: placeLayoutAndPushDown(
          {
            ...selected,
            x: clamp(selected.x + deltaX, 0, ART_GRID_COLUMNS - selected.w),
            y: Math.max(0, selected.y + deltaY)
          },
          layouts
        )
      }
    })
  }

  const moveSelectedImageToEdge = (
    edge: 'left' | 'right' | 'top' | 'bottom'
  ) => {
    if (!selectedLayout) return

    setCuration((current) => {
      const layouts = current[selectedLayout.mode]
      const selected = layouts.find((layout) => layout.id === selectedLayout.id)
      if (!selected) return current

      const otherLayouts = layouts.filter((layout) => layout.id !== selected.id)
      const bottom = Math.max(
        0,
        ...otherLayouts.map((layout) => layout.y + layout.h)
      )
      const next = {
        ...selected,
        x:
          edge === 'left'
            ? 0
            : edge === 'right'
              ? ART_GRID_COLUMNS - selected.w
              : selected.x,
        y: edge === 'top' ? 0 : edge === 'bottom' ? bottom : selected.y
      }

      return {
        ...current,
        [selectedLayout.mode]: placeLayoutAndPushDown(next, layouts)
      }
    })
  }

  const fitSelectedImage = () => {
    if (!selectedLayout || !selectedLayoutItem || !selectedArtItem) return

    const grid =
      timelineRef.current?.querySelector<HTMLElement>('.site-art-grid')
    const metrics = grid ? getGridMetrics(grid, editorZoom) : null

    setCuration((current) => ({
      ...current,
      [selectedLayout.mode]: current[selectedLayout.mode].map((layout) => {
        if (layout.id !== selectedLayout.id) return layout

        const width = metrics
          ? getGridSpanSize(layout.w, metrics.columnSize, metrics.columnGap)
          : layout.w
        const height = metrics
          ? getGridSpanSize(layout.h, metrics.rowSize, metrics.rowGap)
          : layout.h
        const boxRatio = width / height
        const boxIsWiderThanImage = boxRatio > selectedArtItem.ratio
        const imageWidth = boxIsWiderThanImage
          ? height * selectedArtItem.ratio
          : width
        const imageHeight = imageWidth / selectedArtItem.ratio
        const nextWidth = metrics
          ? boxIsWiderThanImage
            ? getClosestGridSpan(
                imageWidth,
                metrics.columnSize,
                metrics.columnGap,
                layout.w
              )
            : layout.w
          : boxIsWiderThanImage
            ? Math.max(2, Math.round(layout.h * selectedArtItem.ratio))
            : layout.w
        const nextHeight = metrics
          ? boxIsWiderThanImage
            ? layout.h
            : getClosestGridSpan(
                imageHeight,
                metrics.rowSize,
                metrics.rowGap,
                layout.h
              )
          : boxIsWiderThanImage
            ? layout.h
            : Math.max(2, Math.round(layout.w / selectedArtItem.ratio))

        return resizeLayoutWithoutOverlap(
          {
            ...layout,
            innerPadding: undefined,
            w: clamp(nextWidth, 2, ART_GRID_COLUMNS - layout.x),
            h: Math.max(2, nextHeight)
          },
          current[selectedLayout.mode]
        )
      })
    }))
  }

  const adjustSelectedInnerPadding = (
    side: keyof InnerPadding,
    direction: -1 | 1
  ) => {
    if (!selectedLayout || !selectedLayoutItem) return

    setCuration((current) => {
      const layouts = current[selectedLayout.mode]
      const selected = layouts.find((layout) => layout.id === selectedLayout.id)
      if (!selected) return current

      const currentPadding = getInnerPadding(selected.innerPadding, side)
      const currentIndex = editorPaddingSteps.reduce(
        (closestIndex, step, index) =>
          Math.abs(step - currentPadding) <
          Math.abs(editorPaddingSteps[closestIndex] - currentPadding)
            ? index
            : closestIndex,
        0
      )
      const nextIndex = clamp(
        currentIndex + direction,
        0,
        editorPaddingSteps.length - 1
      )

      return {
        ...current,
        [selectedLayout.mode]: layouts.map((layout) =>
          layout.id === selectedLayout.id
            ? {
                ...layout,
                innerPadding: {
                  bottom: getInnerPadding(layout.innerPadding, 'bottom'),
                  left: getInnerPadding(layout.innerPadding, 'left'),
                  right: getInnerPadding(layout.innerPadding, 'right'),
                  top: getInnerPadding(layout.innerPadding, 'top'),
                  [side]: editorPaddingSteps[nextIndex]
                }
              }
            : layout
        )
      }
    })
  }

  const resetSelectedInnerPadding = () => {
    if (!selectedLayout || !selectedLayoutItem) return

    setCuration((current) => ({
      ...current,
      [selectedLayout.mode]: current[selectedLayout.mode].map((layout) =>
        layout.id === selectedLayout.id
          ? { ...layout, innerPadding: undefined }
          : layout
      )
    }))
  }

  const adjustEditorZoom = (direction: -1 | 1) => {
    setEditorZoom((current) => {
      const currentIndex = editorZoomSteps.reduce(
        (closestIndex, step, index) =>
          Math.abs(step - current) <
          Math.abs(editorZoomSteps[closestIndex] - current)
            ? index
            : closestIndex,
        0
      )
      const nextIndex = clamp(
        currentIndex + direction,
        0,
        editorZoomSteps.length - 1
      )

      return editorZoomSteps[nextIndex]
    })
  }

  const globalPlacements = getGlobalLayoutPlacements(layoutMode, curation)
  const globalDateAnchors = getGlobalDateAnchors(layoutMode, curation)
  const activeLayout = layoutInteraction
    ? curation[layoutInteraction.mode].find(
        (layout) => layout.id === layoutInteraction.id
      )
    : undefined
  const alignmentGuides =
    editMode && layoutInteraction?.mode === layoutMode && activeLayout
      ? getAlignmentGuides(activeLayout, curation[layoutMode])
      : []

  return (
    <div
      className={`site-art${editMode ? ' is-editor' : ''}`}
      style={{ '--art-editor-zoom': editorZoom } as React.CSSProperties}>
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
              onClick={() => {
                setSelectedLayout(null)
                setLayoutMode(mode)
              }}>
              <LayoutIcon mode={mode} />
              <span>{mode === 'small' ? 'Small' : 'Big'}</span>
            </button>
          ))}
        </div>
      </header>

      {editMode ? (
        <div className='site-art-editor-panel'>
          <div>
            <p className='site-art-editor-label'>Layout editor</p>
            <p>100 points · drag, resize, and add inner padding</p>
          </div>
          <div className='site-art-editor-image'>
            <span>
              Image / {selectedLayoutItem ? 'Selected' : 'Select an image'}
            </span>
            <div className='site-art-editor-image-buttons'>
              <button
                type='button'
                aria-label='Move image left'
                disabled={!selectedLayoutItem}
                onClick={() => moveSelectedImage(-1, 0)}>
                ←
              </button>
              <button
                type='button'
                aria-label='Move image up'
                disabled={!selectedLayoutItem}
                onClick={() => moveSelectedImage(0, -1)}>
                ↑
              </button>
              <button
                type='button'
                aria-label='Move image down'
                disabled={!selectedLayoutItem}
                onClick={() => moveSelectedImage(0, 1)}>
                ↓
              </button>
              <button
                type='button'
                aria-label='Move image right'
                disabled={!selectedLayoutItem}
                onClick={() => moveSelectedImage(1, 0)}>
                →
              </button>
            </div>
            <button
              type='button'
              className='site-art-editor-fit'
              disabled={!selectedLayoutItem}
              onClick={fitSelectedImage}>
              Fit image
            </button>
          </div>
          <div className='site-art-editor-jump'>
            <span>Jump image</span>
            <div className='site-art-editor-jump-buttons'>
              <button
                type='button'
                aria-label='Move image to left edge'
                disabled={!selectedLayoutItem}
                onClick={() => moveSelectedImageToEdge('left')}>
                ⇤
              </button>
              <button
                type='button'
                aria-label='Move image to right edge'
                disabled={!selectedLayoutItem}
                onClick={() => moveSelectedImageToEdge('right')}>
                ⇥
              </button>
              <button
                type='button'
                aria-label='Move image to top'
                disabled={!selectedLayoutItem}
                onClick={() => moveSelectedImageToEdge('top')}>
                ⇡
              </button>
              <button
                type='button'
                aria-label='Move image to bottom'
                disabled={!selectedLayoutItem}
                onClick={() => moveSelectedImageToEdge('bottom')}>
                ⇣
              </button>
            </div>
          </div>
          <div className='site-art-editor-padding'>
            <span>
              Inner padding /{' '}
              {selectedLayoutItem ? 'Selected' : 'Select an image'}
            </span>
            <div className='site-art-editor-padding-buttons'>
              {paddingSides.map(({ label, side }) => (
                <div className='site-art-editor-padding-side' key={side}>
                  <span>{label}</span>
                  <button
                    type='button'
                    aria-label={`Decrease ${label.toLowerCase()} inner padding`}
                    disabled={!selectedLayoutItem}
                    onClick={() => adjustSelectedInnerPadding(side, -1)}>
                    −
                  </button>
                  <output aria-live='polite'>
                    {getInnerPadding(selectedLayoutItem?.innerPadding, side)}px
                  </output>
                  <button
                    type='button'
                    aria-label={`Increase ${label.toLowerCase()} inner padding`}
                    disabled={!selectedLayoutItem}
                    onClick={() => adjustSelectedInnerPadding(side, 1)}>
                    +
                  </button>
                </div>
              ))}
              <button
                type='button'
                aria-label='Reset inner padding'
                disabled={!selectedLayoutItem}
                onClick={resetSelectedInnerPadding}>
                Reset
              </button>
            </div>
          </div>
          <div className='site-art-editor-position'>
            <span>
              Image position /{' '}
              {selectedLayoutItem ? 'Selected' : 'Select an image'}
            </span>
            <div className='site-art-editor-position-buttons'>
              {mediaPositions.map(({ label, value }) => (
                <button
                  key={value}
                  type='button'
                  disabled={!selectedLayoutItem}
                  aria-pressed={
                    (selectedLayoutItem?.objectPosition ?? 'center') === value
                  }
                  onClick={() => setSelectedImagePosition(value)}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className='site-art-editor-zoom' aria-label='Grid zoom'>
            <span>Zoom</span>
            <button
              type='button'
              aria-label='Zoom out'
              disabled={editorZoom === editorZoomSteps[0]}
              onClick={() => adjustEditorZoom(-1)}>
              −
            </button>
            <output aria-live='polite'>{Math.round(editorZoom * 100)}%</output>
            <button
              type='button'
              aria-label='Zoom in'
              disabled={
                editorZoom === editorZoomSteps[editorZoomSteps.length - 1]
              }
              onClick={() => adjustEditorZoom(1)}>
              +
            </button>
            <button
              type='button'
              aria-label='Reset grid zoom'
              onClick={() => setEditorZoom(1)}>
              Reset
            </button>
          </div>
          <div className='site-art-editor-actions'>
            <button type='button' onClick={resetCurrentLayout}>
              Reset {layoutMode}
            </button>
            <button type='button' onClick={() => setEditorMode(false)}>
              Done
            </button>
          </div>
        </div>
      ) : null}

      <div
        className='site-art-timeline-viewport'
        style={
          editMode && timelineViewportHeight !== null
            ? { height: timelineViewportHeight }
            : undefined
        }>
        <div ref={timelineRef} className='site-art-timeline'>
          <div
            className={`site-art-grid site-art-grid--${layoutMode}${editMode ? ' is-editing' : ''}`}
            style={
              {
                '--art-grid-gap': '2px',
                '--art-grid-row-height': '8px'
              } as React.CSSProperties
            }>
            {editMode ? (
              <>
                <div className='site-art-grid-guides' aria-hidden='true'>
                  {artGridColumns.map((column) => (
                    <span key={column} />
                  ))}
                </div>
                <div className='site-art-grid-ruler' aria-hidden='true'>
                  {gridRulerLabels.map((label) => (
                    <span key={label}>{label}</span>
                  ))}
                </div>
                {alignmentGuides.length > 0 ? (
                  <div className='site-art-alignment-guides' aria-hidden='true'>
                    {alignmentGuides.map((guide) => (
                      <span
                        className={`site-art-alignment-guide site-art-alignment-guide--${guide.axis}`}
                        key={`${guide.axis}-${guide.position}-${guide.start}`}
                        style={
                          {
                            '--art-guide-position': guide.position + 1,
                            '--art-guide-span': guide.span,
                            '--art-guide-start': guide.start + 1
                          } as React.CSSProperties
                        }
                      />
                    ))}
                  </div>
                ) : null}
              </>
            ) : null}
            {globalDateAnchors.map((anchor) => (
              <div
                className='site-art-grid-date'
                key={anchor.date}
                style={
                  {
                    '--art-date-column': anchor.column,
                    '--art-date-height': anchor.height,
                    '--art-date-row': anchor.row,
                    '--art-date-span': anchor.span
                  } as React.CSSProperties
                }>
                <time dateTime={anchor.date}>{anchor.label}</time>
              </div>
            ))}
            {globalPlacements.map((placement, index) => {
              const item = placement.item
              const itemIndex = artItems.indexOf(item)
              const isInteracting =
                layoutInteraction?.id === placement.layout.id
              const isSelected =
                selectedLayout?.id === placement.layout.id &&
                selectedLayout.mode === layoutMode

              return (
                <button
                  key={item.id}
                  type='button'
                  className={`site-art-card${editMode ? ' is-editing' : ''}${isInteracting ? ' is-interacting' : ''}${isSelected ? ' is-selected' : ''}`}
                  aria-label={
                    editMode
                      ? `${getItemLabel(item)} from ${item.dateLabel}. Position ${placement.layout.x + 1}, ${placement.layout.y + 1}; size ${placement.layout.w} by ${placement.layout.h} points. Use arrow keys to move.`
                      : `Open ${getItemLabel(item).toLowerCase()} from ${item.dateLabel}`
                  }
                  style={
                    {
                      '--art-column': placement.layout.x + 1,
                      '--art-row': placement.layout.y + 1,
                      '--art-span': placement.layout.w,
                      '--art-height': placement.layout.h,
                      '--art-ratio': item.ratio,
                      '--art-inner-padding-bottom': `${getInnerPadding(placement.layout.innerPadding, 'bottom')}px`,
                      '--art-inner-padding-left': `${getInnerPadding(placement.layout.innerPadding, 'left')}px`,
                      '--art-inner-padding-right': `${getInnerPadding(placement.layout.innerPadding, 'right')}px`,
                      '--art-inner-padding-top': `${getInnerPadding(placement.layout.innerPadding, 'top')}px`,
                      '--art-object-position': getObjectPosition(
                        placement.layout.objectPosition
                      )
                    } as React.CSSProperties
                  }
                  onClick={
                    editMode
                      ? () =>
                          setSelectedLayout({
                            date: placement.date,
                            id: placement.layout.id,
                            mode: layoutMode
                          })
                      : (event) => openLightbox(event, itemIndex)
                  }
                  onFocus={() => {
                    if (editMode)
                      setSelectedLayout({
                        date: placement.date,
                        id: placement.layout.id,
                        mode: layoutMode
                      })
                  }}
                  onKeyDown={(event) =>
                    handleEditorKeyDown(event, layoutMode, placement.layout)
                  }
                  onPointerDown={(event) =>
                    startLayoutInteraction(
                      event,
                      layoutMode,
                      placement.date,
                      placement.layout,
                      'move'
                    )
                  }
                  onPointerMove={updateLayoutInteraction}
                  onPointerUp={finishLayoutInteraction}
                  onPointerCancel={finishLayoutInteraction}>
                  <span className='site-art-media'>
                    <span className='site-art-media-content'>
                      <ArtMedia
                        item={item}
                        sizes='(max-width: 479px) 92vw, (max-width: 900px) 75vw, 45vw'
                        priority={itemIndex < 4 || index < 2}
                      />
                    </span>
                  </span>
                  {editMode ? (
                    <>
                      {resizeCorners.map(({ className, value }) => (
                        <span
                          className={`site-art-resize-handle site-art-image-resize-handle site-art-resize-handle--${className}`}
                          key={value}
                          aria-hidden='true'
                          onPointerDown={(event) =>
                            startLayoutInteraction(
                              event,
                              layoutMode,
                              placement.date,
                              placement.layout,
                              'resize',
                              value
                            )
                          }
                          onPointerMove={updateLayoutInteraction}
                          onPointerUp={finishLayoutInteraction}
                          onPointerCancel={finishLayoutInteraction}>
                          <span />
                          <span />
                        </span>
                      ))}
                    </>
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>
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
