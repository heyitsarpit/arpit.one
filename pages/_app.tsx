import '@/styles/tailwind.css'

import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import type { AppProps } from 'next/app'
import { Source_Serif_4 } from 'next/font/google'
import Head from 'next/head'
import { useRouter } from 'next/router'
import type { ReactElement } from 'react'

import Nav from '@/components/Nav'
import type { PageWithLayout } from '@/components/PlaylistsLayout'
import { SEO } from '@/components/SEO'
import { resolvePageTheme } from '@/utils/pageThemes'
import {
  queryCacheMaxAge,
  queryClient,
  queryPersister
} from '@/utils/queryClient'

const sourceSerif4 = Source_Serif_4({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-source-serif-4',
  weight: ['400', '500']
})

type AppPropsWithLayout = AppProps & {
  Component: AppProps['Component'] & PageWithLayout
}

const MyApp: React.FC<AppPropsWithLayout> = ({ Component, pageProps }) => {
  const router = useRouter()

  const pageTheme = resolvePageTheme(router.asPath || router.pathname)

  const getLayout = Component.getLayout || ((page: ReactElement) => page)

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        buster: 'spotify-query-cache-v1',
        maxAge: queryCacheMaxAge,
        persister: queryPersister,
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => query.state.status === 'success'
        }
      }}>
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
        `}</style>
      </Head>
      <SEO />
      <div
        className={`${sourceSerif4.variable} min-h-screen w-full bg-[color:var(--page-background)] text-[color:var(--page-text)]`}>
        <Nav />
        <main className='w-full'>
          {getLayout(<Component {...pageProps} />)}
        </main>
        <footer />
      </div>
    </PersistQueryClientProvider>
  )
}

export default MyApp
