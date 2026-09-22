import Head from 'next/head'
import { useRouter } from 'next/router'
import { generateNextSeo } from 'next-seo/pages'

import PlaylistExplorer from '@/components/PlaylistExplorer'
import PlaylistPageNav from '@/components/PlaylistPageNav'
import PlaylistsLayout, {
  type PageWithLayout
} from '@/components/PlaylistsLayout'
import { SectionHeading, StatusMessage } from '@/components/SitePrimitives'
import { usePlaylistLibrary } from '@/utils/playlistQuery'

const Playlists: React.FC & PageWithLayout = () => {
  const router = useRouter()
  const { data: library, error, isPending } = usePlaylistLibrary()
  const routePlaylistId =
    typeof router.query.playlistId === 'string' ? router.query.playlistId : null
  const routePlaylist = library?.playlists.find(
    (playlist) => playlist.id === routePlaylistId
  )
  const canonicalPath = routePlaylistId
    ? `/playlists/${encodeURIComponent(routePlaylistId)}`
    : '/playlists'

  return (
    <>
      <Head>
        {generateNextSeo({
          title: routePlaylist
            ? `${routePlaylist.name} - Playlists`
            : 'Playlists',
          canonical: `https://www.arpit.one${canonicalPath}`,
          openGraph: { url: `https://www.arpit.one${canonicalPath}` }
        })}
      </Head>
      <header className='mb-10 flex items-baseline justify-between gap-6 max-[479px]:gap-4'>
        <SectionHeading titleClassName='mb-0 font-serif'>
          Playlists
        </SectionHeading>
        <PlaylistPageNav active='playlists' />
      </header>
      {isPending ? (
        <StatusMessage>Loading playlists…</StatusMessage>
      ) : error ? (
        <StatusMessage>{error.message}</StatusMessage>
      ) : library ? (
        <PlaylistExplorer playlists={library.playlists} />
      ) : null}
    </>
  )
}

Playlists.getLayout = (page) => <PlaylistsLayout>{page}</PlaylistsLayout>

export default Playlists
