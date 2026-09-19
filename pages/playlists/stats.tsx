import { NextSeo } from 'next-seo'

import PlaylistPageNav from '@/components/PlaylistPageNav'
import PlaylistsLayout, {
  type PageWithLayout
} from '@/components/PlaylistsLayout'
import SpotifyStats from '@/components/SpotifyStats'
import { usePlaylistLibrary } from '@/utils/playlistQuery'

const PlaylistStatsPage: React.FC & PageWithLayout = () => {
  const { data: library, error, isPending } = usePlaylistLibrary()

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
      {isPending ? (
        <p className='site-spotify-status'>Loading playlist stats…</p>
      ) : error ? (
        <p className='site-spotify-status'>{error.message}</p>
      ) : library ? (
        <SpotifyStats library={library} />
      ) : null}
    </>
  )
}

PlaylistStatsPage.getLayout = (page) => (
  <PlaylistsLayout>{page}</PlaylistsLayout>
)

export default PlaylistStatsPage
