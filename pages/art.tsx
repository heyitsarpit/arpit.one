import Head from 'next/head'
import { generateNextSeo } from 'next-seo/pages'

import { ArtGalleryGrid } from '@/components/ArtGalleryGrid'

const Art: React.FC = () => (
  <>
    <Head>
      {generateNextSeo({
        title: 'Art & Photography',
        description: 'Art, photography, and motion work by Arpit Bharti.',
        canonical: 'https://www.arpit.one/art',
        openGraph: { url: 'https://www.arpit.one/art' }
      })}
    </Head>
    <ArtGalleryGrid />
  </>
)

export default Art
