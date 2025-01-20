import '@/public/styles/font.css';
import '@/public/styles/global.css';

import { AppProps } from 'next/app';
import Head from 'next/head';

import Nav from '@/components/Nav';
import { SEO } from '@/components/SEO';
import {Cursor} from "@/components/Cursor"

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <SEO />
      <Cursor />
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
