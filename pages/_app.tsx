if (process.env.NODE_ENV === 'development') {
  require('preact/debug');
}

import '@/public/styles/font.css';
import '@/public/styles/global.css';

import splitbee from '@splitbee/web';
import { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useEffect } from 'react';

import Nav from '@/components/Nav';
import { SEO } from '@/components/SEO';

const DynamicCursor = dynamic(() => import('../components/Cursor').then((m) => m.Cursor), {
  ssr: false
});

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {
  useEffect(() => {
    splitbee.init({
      scriptUrl: '/bee.js',
      apiUrl: '/_hive'
    });
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <SEO />
      <DynamicCursor />
      <div className="w-full h-full">
        <Nav />
        <main className="w-full">
          <Component {...pageProps} />
        </main>
        <footer></footer>
      </div>
    </>
  );
};

export default MyApp;
