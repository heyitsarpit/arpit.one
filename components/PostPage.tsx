import type { PostMeta } from 'mdx'
import Head from 'next/head'
import Link from 'next/link'
import { generateNextSeo } from 'next-seo/pages'

import { focusRingClassName } from '@/components/SitePrimitives'
import { formateDateFull, validDate } from '@/utils/formatDate'

type Props = {
  meta: PostMeta
  children: React.ReactNode
}

export function PostPage({ meta, children }: Props) {
  return (
    <>
      <Head>
        {generateNextSeo({
          title: `${meta.title} - Arpit`,
          description: meta.description,
          canonical: `https://www.arpit.one/writing/${meta.slug}`,
          openGraph: { url: `https://www.arpit.one/writing/${meta.slug}` }
        })}
      </Head>
      <article className='mx-auto min-h-screen w-[min(680px,calc(100%_-_40px))] pb-24 pt-[106px] text-[color:var(--page-text)] lg:py-[8vw]'>
        <header className='mb-16'>
          <Link
            href='/writing'
            className={`mb-14 inline-block font-ui text-base text-[color:var(--page-muted)] no-underline transition-colors hover:text-[color:var(--page-highlight)] ${focusRingClassName}`}>
            ← All writing
          </Link>
          <h1 className='m-0 max-w-[620px] font-serif text-[28px] font-normal leading-[1.2] tracking-[-0.015em]'>
            {meta.title}
          </h1>
          <time
            className='mt-4 block font-ui text-base leading-[1.45] text-[color:var(--page-muted)]'
            dateTime={validDate(meta.date)}>
            {formateDateFull(meta.date)}
          </time>
          <p className='mb-0 mt-8 max-w-[58ch] font-ui text-base leading-[1.55] text-[color:var(--page-muted)]'>
            {meta.description}
          </p>
        </header>
        <div className='site-writing-body font-body text-base leading-[1.65] text-[color:var(--page-text)] [&_a]:decoration-[color:var(--page-highlight)] [&_blockquote]:my-8 [&_blockquote]:border-l [&_blockquote]:border-[color:var(--page-highlight)] [&_blockquote]:pl-5 [&_blockquote]:text-[color:var(--page-muted)] [&_code]:font-code [&_h1]:mb-4 [&_h1]:mt-14 [&_h1]:font-serif [&_h1]:text-[22px] [&_h1]:font-normal [&_h1]:leading-[1.35] [&_h2]:mb-4 [&_h2]:mt-14 [&_h2]:font-serif [&_h2]:text-[22px] [&_h2]:font-normal [&_h2]:leading-[1.35] [&_h3]:mb-4 [&_h3]:mt-12 [&_h3]:font-serif [&_h3]:text-xl [&_h3]:font-normal [&_h4]:mb-4 [&_h4]:mt-12 [&_h4]:font-ui [&_h4]:text-base [&_h5]:mb-4 [&_h5]:mt-12 [&_h5]:font-ui [&_h5]:text-base [&_h6]:mb-4 [&_h6]:mt-12 [&_h6]:font-ui [&_h6]:text-base [&_img]:my-8 [&_img]:w-full [&_li]:mb-2 [&_li]:p-0 [&_ol]:mb-6 [&_ol]:pl-6 [&_p]:mb-5 [&_pre]:my-8 [&_pre]:overflow-auto [&_pre]:border [&_pre]:border-[color:var(--page-border)] [&_pre]:bg-[color-mix(in_srgb,var(--page-text)_5%,transparent)] [&_pre]:p-5 [&_pre]:shadow-none [&_strong]:font-medium [&_ul]:mb-6 [&_ul]:pl-6 [&_hr]:my-12 [&_hr]:border-[color:var(--page-border)]'>
          {children}
        </div>
      </article>
    </>
  )
}
