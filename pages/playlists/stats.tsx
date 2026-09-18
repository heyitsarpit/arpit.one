import fs from 'node:fs'
import path from 'node:path'
import type { InferGetStaticPropsType } from 'next'
import { NextSeo } from 'next-seo'

import PlaylistPageNav from '@/components/PlaylistPageNav'
import PlaylistsLayout, {
  type PageWithLayout
} from '@/components/PlaylistsLayout'
import SpotifyStats from '@/components/SpotifyStats'
import type { StoredPlaylistLibrary } from '@/utils/playlists'

export const getStaticProps = async () => {
  const file = path.resolve(process.cwd(), 'data', 'spotify-playlists.json')
  const library = JSON.parse(
    fs.readFileSync(file, 'utf-8')
  ) as StoredPlaylistLibrary

  return { props: { library } }
}

type Props = InferGetStaticPropsType<typeof getStaticProps>

const PlaylistStatsPage: React.FC<Props> & PageWithLayout = ({ library }) => {
  return (
    <>
      <NextSeo
        title='Playlist stats'
        canonical='https://www.arpit.one/playlists/stats'
        openGraph={{ url: 'https://www.arpit.one/playlists/stats' }}
      />
      <header className='site-playlists-header'>
        <h1 className='site-section-title'>Stats</h1>
        <PlaylistPageNav active='stats' />
      </header>
      <SpotifyStats library={library} />
    </>
  )
}

PlaylistStatsPage.getLayout = (page) => (
  <PlaylistsLayout>{page}</PlaylistsLayout>
)

export default PlaylistStatsPage
