import Head from 'next/head'
import { generateDefaultSeo } from 'next-seo/pages'

export const SEO: React.FC = () => {
  return (
    <Head>
      {generateDefaultSeo({
        title: 'Arpit',
        description: 'Software Developer',
        canonical: 'https://www.arpit.one/',
        openGraph: {
          url: 'https://www.arpit.one/',
          title: 'Arpit',
          description: 'Software Developer',
          site_name: 'Arpit'
        },
        twitter: {
          handle: '@heyitsarpit',
          site: '@heyitsarpit',
          cardType: 'summary_large_image'
        }
      })}
    </Head>
  )
}
