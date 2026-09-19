export type ArtView = 'big' | 'small'

export type LayoutItem = {
  id: string
  x: number
  y: number
  w: number
  h: number
}

export type ArtLayout = Record<string, LayoutItem[]>

export type ArtCuration = Record<ArtView, ArtLayout>

export type CurationItem = {
  id: string
  ratio: number
}

export type CurationGroup = {
  date: string
  items: CurationItem[]
}

const bigWidths = [12, 7, 5, 8, 4, 4, 6, 6, 9, 3]
const smallWidths = [4, 4, 4, 6, 6, 8, 4, 8, 5, 7]

const getHeight = (width: number, ratio: number) =>
  Math.max(4, Math.round((width / Math.max(ratio, 0.25)) * 1.75))

export const createDefaultLayout = (
  items: CurationItem[],
  view: ArtView,
  startY = 0
): LayoutItem[] => {
  const widths = view === 'big' ? bigWidths : smallWidths
  const layout: LayoutItem[] = []
  let x = 0
  let y = startY
  let rowHeight = 0

  items.forEach((item, index) => {
    const requestedWidth = widths[index % widths.length]
    let width = requestedWidth

    if (x + width > 12) {
      if (x > 0) {
        x = 0
        y += rowHeight + 1
        rowHeight = 0
      }
      width = Math.min(requestedWidth, 12)
    }

    const height = getHeight(width, item.ratio)

    layout.push({
      id: item.id,
      x,
      y,
      w: width,
      h: height
    })

    rowHeight = Math.max(rowHeight, height)
    x += width

    if (x >= 12) {
      x = 0
      y += rowHeight + 1
      rowHeight = 0
    }
  })

  return layout
}

export const resolveArtLayout = (
  items: CurationItem[],
  configured: LayoutItem[] | undefined,
  view: ArtView
): LayoutItem[] => {
  const itemIds = new Set(items.map((item) => item.id))
  const seen = new Set<string>()
  const validConfigured = (configured ?? []).filter((entry) => {
    if (!itemIds.has(entry.id) || seen.has(entry.id)) return false
    seen.add(entry.id)
    return true
  })
  const remaining = items.filter((item) => !seen.has(item.id))
  const configuredBottom = validConfigured.reduce(
    (bottom, entry) => Math.max(bottom, entry.y + entry.h),
    0
  )

  return [
    ...validConfigured,
    ...createDefaultLayout(
      remaining,
      view,
      validConfigured.length > 0 ? configuredBottom + 1 : 0
    )
  ]
}

export const normalizeArtCuration = (
  seed: ArtCuration,
  groups: CurationGroup[]
): ArtCuration => ({
  big: Object.fromEntries(
    groups.map((group) => [
      group.date,
      resolveArtLayout(group.items, seed.big?.[group.date], 'big')
    ])
  ),
  small: Object.fromEntries(
    groups.map((group) => [
      group.date,
      resolveArtLayout(group.items, seed.small?.[group.date], 'small')
    ])
  )
})

export const artCuration: ArtCuration = {
  big: {
    '2026-09': [
      {
        id: 'photography-IMG_3498',
        x: 0,
        y: 0,
        w: 12,
        h: 12
      },
      {
        id: 'photography-DSCF6055',
        x: 0,
        y: 13,
        w: 6,
        h: 8
      }
    ],
    '2025-02': [
      {
        id: 'photography-DSCF1521',
        x: 0,
        y: 0,
        w: 6,
        h: 8
      },
      {
        id: 'photography-DSCF1545',
        x: 6,
        y: 0,
        w: 6,
        h: 8
      },
      {
        id: 'photography-DSCF1549',
        x: 0,
        y: 9,
        w: 12,
        h: 12
      }
    ],
    '2018-11': [
      {
        id: 'image-2-/_next/static/media/2018-11-03_14-17-42_UTC.0-hzlyh6qee8j.jpg',
        x: 0,
        y: 0,
        w: 12,
        h: 10
      }
    ],
    '2018-04': [
      {
        id: 'image-9-/_next/static/media/2018-04-06_19-07-41_UTC.06l_37_mo-ync.jpg',
        x: 0,
        y: 0,
        w: 12,
        h: 10
      }
    ],
    '2017-06': [
      {
        id: 'image-18-/_next/static/media/2017-06-24_17-34-01_UTC.031-wep.dqmvu.jpg',
        x: 0,
        y: 0,
        w: 6,
        h: 8
      },
      {
        id: 'image-19-/_next/static/media/2017-06-03_20-34-40_UTC.0gh8zjh.g5d~2.jpg',
        x: 6,
        y: 0,
        w: 6,
        h: 8
      },
      {
        id: 'image-20-/_next/static/media/2017-06-03_18-57-54_UTC.0n8akgo5t9ls8.jpg',
        x: 0,
        y: 9,
        w: 12,
        h: 10
      }
    ],
    '2017-05': [
      {
        id: 'image-21-/_next/static/media/2017-05-23_15-19-00_UTC.16wmwoej_xepm.jpg',
        x: 0,
        y: 0,
        w: 12,
        h: 10
      }
    ]
  },
  small: {}
}
