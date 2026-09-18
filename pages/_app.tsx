import '@/public/styles/font.css'
import '@/public/styles/global.css'

import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useRouter } from 'next/router'

import Nav from '@/components/Nav'
import { SEO } from '@/components/SEO'
import { resolvePageTheme } from '@/utils/pageThemes'

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {
  const router = useRouter()
  const pageTheme = resolvePageTheme(router.asPath || router.pathname)
  const pageStyle = {
    '--page-text': pageTheme.text,
    '--page-background': pageTheme.background,
    '--page-highlight': pageTheme.highlight,
    '--page-text-highlight': pageTheme.textHighlight,
    '--page-text-highlight-text': pageTheme.textHighlightText,
    '--page-muted': pageTheme.muted,
    '--page-border': pageTheme.border,
    backgroundColor: pageTheme.background,
    color: pageTheme.text
  } as React.CSSProperties

  return (
    <>
      <Head>
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <meta name='theme-color' content={pageTheme.background} />
        <style key='page-theme'>{`
            :root {
              --page-text: ${pageTheme.text};
              --page-background: ${pageTheme.background};
              --page-highlight: ${pageTheme.highlight};
              --page-text-highlight: ${pageTheme.textHighlight};
              --page-text-highlight-text: ${pageTheme.textHighlightText};
              --page-muted: ${pageTheme.muted};
              --page-border: ${pageTheme.border};
            }

            html,
            body,
            #__next {
              color: ${pageTheme.text};
              background-color: ${pageTheme.background};
            }
        `}</style>
      </Head>
      <SEO />
      <div className='site-shell' style={pageStyle}>
        <Nav />
        <main className='site-main'>
          <Component {...pageProps} />
        </main>
        <footer />
      </div>
    </>
  )
}

export default MyApp
