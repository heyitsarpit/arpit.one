import { DefaultSeo } from 'next-seo'

export const SEO: React.FC = () => {
  return (
    <DefaultSeo
      title='Arpit'
      description='Software Developer'
      canonical='https://www.arpit.one/'
      openGraph={{
        url: 'https://www.arpit.one/',
        title: 'Arpit',
        description: 'Software Developer',
        site_name: 'Arpit'
        // images: [
        //   {
        //     url: 'https://www.example.ie/og-image-01.jpg',
        //     width: 800,
        //     height: 600,
        //     alt: 'Og Image Alt'
        //   },
        //   {
        //     url: 'https://www.example.ie/og-image-02.jpg',
        //     width: 900,
        //     height: 800,
        //     alt: 'Og Image Alt Second'
        //   },
        //   { url: 'https://www.example.ie/og-image-03.jpg' },
        //   { url: 'https://www.example.ie/og-image-04.jpg' }
        // ]
      }}
      twitter={{
        handle: '@heyitsarpit',
        site: '@heyitsarpit',
        cardType: 'summary_large_image'
      }}
    />
  )
}
