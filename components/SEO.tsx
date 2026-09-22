import Head from 'next/head'
import { generateDefaultSeo } from 'next-seo/pages'

export const SEO: React.FC = () => {
  return (
    <Head>
      {generateDefaultSeo({
        title: 'Arpit',
        description:
          'Independent software engineer exploring software automation and human-AI collaboration.',
        canonical: 'https://www.arpit.one/',
        openGraph: {
          url: 'https://www.arpit.one/',
          title: 'Arpit',
          description:
            'Independent software engineer exploring software automation and human-AI collaboration.',
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
