import Head from 'next/head'
import { generateNextSeo } from 'next-seo/pages'

import PlaylistExplorer from '@/components/PlaylistExplorer'
import PlaylistPageNav from '@/components/PlaylistPageNav'
import PlaylistsLayout, {
  type PageWithLayout
} from '@/components/PlaylistsLayout'
import { SectionHeading, StatusMessage } from '@/components/SitePrimitives'
import { usePlaylistLibrary } from '@/utils/playlistQuery'

const Playlists: React.FC & PageWithLayout = () => {
  const { data: library, error, isPending } = usePlaylistLibrary()

  return (
    <>
      <Head>
        {generateNextSeo({
          title: 'Playlists',
          canonical: 'https://www.arpit.one/playlists',
          openGraph: { url: 'https://www.arpit.one/playlists' }
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
