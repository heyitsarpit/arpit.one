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
      <article className='max-w-[75ch] mx-auto pt-12 pb-28  px-5'>
        <div>
          <h1 className='mb-1 text-3xl font-black capitalize md:text-4xl'>
            {meta.title}
          </h1>
          <div className='flex items-center pt-4 pb-8 text-sm font-thin uppercase text-stone-500 dark:text-stone-400'>
            <time dateTime={validDate(meta.date)}>
              {formateDateFull(meta.date)}
            </time>
          </div>
          <p className='italic'>{meta.description}</p>
        </div>
        {children}
      </article>
    </>
  )
}
