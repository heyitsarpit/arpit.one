import fs from 'node:fs'
import path from 'node:path'
import type { InferGetStaticPropsType } from 'next'
import { NextSeo } from 'next-seo'

import PlaylistExplorer from '@/components/PlaylistExplorer'
import PlaylistPageNav from '@/components/PlaylistPageNav'
import PlaylistsLayout, {
  type PageWithLayout
} from '@/components/PlaylistsLayout'
import type { StoredPlaylistLibrary } from '@/utils/playlists'

export const getStaticProps = async () => {
  const file = path.resolve(process.cwd(), 'data', 'spotify-playlists.json')
  const library = JSON.parse(
    fs.readFileSync(file, 'utf-8')
  ) as StoredPlaylistLibrary

  return { props: { library } }
}

type Props = InferGetStaticPropsType<typeof getStaticProps>

const Playlists: React.FC<Props> & PageWithLayout = ({ library }) => {
  return (
    <>
      <NextSeo
        title='Playlists'
        canonical='https://www.arpit.one/playlists'
        openGraph={{ url: 'https://www.arpit.one/playlists' }}
      />
      <header className='site-playlists-header'>
        <h1 className='site-section-title'>Playlists</h1>
        <PlaylistPageNav active='playlists' />
      </header>
      <PlaylistExplorer playlists={library.playlists} />
    </>
  )
}

Playlists.getLayout = (page) => <PlaylistsLayout>{page}</PlaylistsLayout>

export default Playlists
