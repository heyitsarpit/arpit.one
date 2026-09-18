import { NextSeo } from 'next-seo'

import PlaylistPageNav from '@/components/PlaylistPageNav'
import PlaylistsLayout, {
  type PageWithLayout
} from '@/components/PlaylistsLayout'
import SpotifyAlbums from '@/components/SpotifyAlbums'

const PlaylistAlbumsPage: React.FC & PageWithLayout = () => {
  return (
    <>
      <NextSeo
        title='Albums'
        canonical='https://www.arpit.one/playlists/albums'
        openGraph={{ url: 'https://www.arpit.one/playlists/albums' }}
      />
      <header className='site-playlists-header'>
        <h1 className='site-section-title'>Albums</h1>
        <PlaylistPageNav active='albums' />
      </header>
      <SpotifyAlbums />
    </>
  )
}

PlaylistAlbumsPage.getLayout = (page) => (
  <PlaylistsLayout>{page}</PlaylistsLayout>
)

export default PlaylistAlbumsPage
