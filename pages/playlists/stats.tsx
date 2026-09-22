import Head from 'next/head'
import { generateNextSeo } from 'next-seo/pages'

import PlaylistPageNav from '@/components/PlaylistPageNav'
import PlaylistsLayout, {
  type PageWithLayout
} from '@/components/PlaylistsLayout'
import { SectionHeading, StatusMessage } from '@/components/SitePrimitives'
import SpotifyStats from '@/components/SpotifyStats'
import { usePlaylistLibrary } from '@/utils/playlistQuery'

const PlaylistStatsPage: React.FC & PageWithLayout = () => {
  const { data: library, error, isPending } = usePlaylistLibrary()

  return (
    <>
      <Head>
        {generateNextSeo({
          title: 'Playlist stats',
          description:
            'Listening statistics and music trends from Arpit Bharti.',
          canonical: 'https://www.arpit.one/playlists/stats',
          openGraph: { url: 'https://www.arpit.one/playlists/stats' }
        })}
      </Head>
      <header className='mb-10 flex items-baseline justify-between gap-6 max-[479px]:gap-4'>
        <SectionHeading titleClassName='mb-0 font-serif'>Stats</SectionHeading>
        <PlaylistPageNav active='stats' />
      </header>
      {isPending ? (
        <StatusMessage>Loading playlist stats…</StatusMessage>
      ) : error ? (
        <StatusMessage>{error.message}</StatusMessage>
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
