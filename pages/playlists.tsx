import { NextSeo } from 'next-seo'

import PlaylistExplorer from '@/components/PlaylistExplorer'
import PlaylistPageNav from '@/components/PlaylistPageNav'
import PlaylistsLayout, {
  type PageWithLayout
} from '@/components/PlaylistsLayout'
import { usePlaylistLibrary } from '@/utils/playlistQuery'

const Playlists: React.FC & PageWithLayout = () => {
  const { data: library, error, isPending } = usePlaylistLibrary()

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
      {isPending ? (
        <p className='site-spotify-status'>Loading playlists…</p>
      ) : error ? (
        <p className='site-spotify-status'>{error.message}</p>
      ) : library ? (
        <PlaylistExplorer playlists={library.playlists} />
      ) : null}
    </>
  )
}

Playlists.getLayout = (page) => <PlaylistsLayout>{page}</PlaylistsLayout>

export default Playlists
