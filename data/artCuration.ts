export type CuratedSpan = 'half' | 'wide'

export type CuratedEntry = {
  id: string
  span: CuratedSpan
}

export type ArtCuration = Record<string, CuratedEntry[]>

export const artCuration: ArtCuration = {
  '2026-09': [
    {
      id: 'photography-IMG_3498',
      span: 'wide'
    },
    {
      id: 'photography-DSCF6055',
      span: 'half'
    }
  ],
  '2025-02': [
    {
      id: 'photography-DSCF1521',
      span: 'half'
    },
    {
      id: 'photography-DSCF1545',
      span: 'half'
    },
    {
      id: 'photography-DSCF1549',
      span: 'wide'
    }
  ],
  '2018-11': [
    {
      id: 'image-2-/_next/static/media/2018-11-03_14-17-42_UTC.0-hzlyh6qee8j.jpg',
      span: 'wide'
    }
  ],
  '2018-04': [
    {
      id: 'image-9-/_next/static/media/2018-04-06_19-07-41_UTC.06l_37_mo-ync.jpg',
      span: 'wide'
    }
  ],
  '2017-06': [
    {
      id: 'image-18-/_next/static/media/2017-06-24_17-34-01_UTC.031-wep.dqmvu.jpg',
      span: 'half'
    },
    {
      id: 'image-19-/_next/static/media/2017-06-03_20-34-40_UTC.0gh8zjh.g5d~2.jpg',
      span: 'half'
    },
    {
      id: 'image-20-/_next/static/media/2017-06-03_18-57-54_UTC.0n8akgo5t9ls8.jpg',
      span: 'wide'
    }
  ],
  '2017-05': [
    {
      id: 'image-21-/_next/static/media/2017-05-23_15-19-00_UTC.16wmwoej_xepm.jpg',
      span: 'wide'
    }
  ]
}
