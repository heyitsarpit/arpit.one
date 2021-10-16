import { DefaultSeo } from 'next-seo';

export const SEO: React.FC = () => {
  return (
    <DefaultSeo
      title="Arpit Bharti"
      description="Software Developer"
      canonical="https://heyitsarpit.dev/"
      openGraph={{
        url: 'https://heyitsarpit.dev/',
        title: 'Arpit',
        description: 'Software Developer',
        site_name: 'heyitsarpit'
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
        handle: '@onygami',
        site: '@onygami',
        cardType: 'summary_large_image'
      }}
    />
  );
};
