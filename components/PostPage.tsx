import { NextSeo } from 'next-seo'
import Head from 'next/head'

import { formateDateFull, validDate } from '@/utils/formatDate'
import type { PostMeta } from 'mdx'

type Props = {
  meta: PostMeta
  children: React.ReactNode
}

export function PostPage({ meta, children }: Props) {
  return (
    <>
      <NextSeo
        title={`${meta.title} - Arpit`}
        description={meta.description}
        canonical={`https://www.arpit.one/posts/${meta.slug}`}
        openGraph={{ url: `https://www.arpit.one/posts/${meta.slug}` }}
      />
      <Head>
        <link rel='stylesheet' href='/styles/prism.css' />
      </Head>
      <article className='site-post-page'>
        <header className='site-post-header'>
          <p className='site-section-kicker'>Writing</p>
          <h1 className='site-post-title'>{meta.title}</h1>
          <time className='site-post-meta' dateTime={validDate(meta.date)}>
            {formateDateFull(meta.date)}
          </time>
          <p className='site-post-description'>{meta.description}</p>
        </header>
        <div className='site-post-body'>{children}</div>
      </article>
    </>
  )
}
