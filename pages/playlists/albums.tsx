import Head from 'next/head'
import { generateNextSeo } from 'next-seo/pages'

import PlaylistPageNav from '@/components/PlaylistPageNav'
import PlaylistsLayout, {
  type PageWithLayout
} from '@/components/PlaylistsLayout'
import { SectionHeading } from '@/components/SitePrimitives'
import SpotifyAlbums from '@/components/SpotifyAlbums'

const PlaylistAlbumsPage: React.FC & PageWithLayout = () => {
  return (
    <>
      <Head>
        {generateNextSeo({
          title: 'Albums',
          canonical: 'https://www.arpit.one/playlists/albums',
          openGraph: { url: 'https://www.arpit.one/playlists/albums' }
        })}
      </Head>
      <header className='mb-10 flex items-baseline justify-between gap-6 max-[479px]:gap-4'>
        <SectionHeading titleClassName='mb-0 font-serif'>Albums</SectionHeading>
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
