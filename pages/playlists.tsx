import fs from 'node:fs'
import path from 'node:path'
import type { InferGetStaticPropsType } from 'next'
import { NextSeo } from 'next-seo'

import LastPlayed from '@/components/LastPlayed'
import PlaylistExplorer from '@/components/PlaylistExplorer'
import type { StoredPlaylistLibrary } from '@/utils/playlists'

export const getStaticProps = async () => {
  const file = path.resolve(process.cwd(), 'data', 'spotify-playlists.json')
  const library = JSON.parse(
    fs.readFileSync(file, 'utf-8')
  ) as StoredPlaylistLibrary

  return { props: { library } }
}

type Props = InferGetStaticPropsType<typeof getStaticProps>

const Playlists: React.FC<Props> = ({ library }) => {
  return (
    <>
      <NextSeo
        title='Playlists'
        canonical='https://www.arpit.one/playlists'
        openGraph={{ url: 'https://www.arpit.one/playlists' }}
      />
      <div className='site-playlists'>
        <LastPlayed />
        <header className='site-playlists-header'>
          <p className='site-section-kicker'>A personal soundtrack</p>
          <h1 className='site-section-title'>Playlists</h1>
        </header>
        <PlaylistExplorer playlists={library.playlists} />
      </div>
    </>
  )
}

export default Playlists
