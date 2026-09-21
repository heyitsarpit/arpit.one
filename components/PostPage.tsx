import type { PostMeta } from 'mdx'
import Head from 'next/head'
import { generateNextSeo } from 'next-seo/pages'

import { SectionHeading } from '@/components/SitePrimitives'
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
          canonical: `https://www.arpit.one/posts/${meta.slug}`,
          openGraph: { url: `https://www.arpit.one/posts/${meta.slug}` }
        })}
        <link rel='stylesheet' href='/styles/prism.css' />
      </Head>
      <article className='mx-auto min-h-screen w-[min(600px,calc(100%_-_40px))] py-[8%] text-[color:var(--page-text)] max-lg:pb-20 max-lg:pt-[106px] max-[479px]:pt-24'>
        <header className='mb-16'>
          <SectionHeading
            kicker='Writing'
            kickerClassName='mb-8'
            titleClassName='text-[28px] max-[479px]:text-[26px]'>
            {meta.title}
          </SectionHeading>
          <time
            className='mt-4 block font-ui text-[13px] leading-[1.5] text-[color:var(--page-muted)]'
            dateTime={validDate(meta.date)}>
            {formateDateFull(meta.date)}
          </time>
          <p className='mt-8 font-body text-xl leading-[1.5] text-[color:var(--page-text)]'>
            {meta.description}
          </p>
        </header>
        <div className='font-body text-[18px] leading-[1.6] tracking-[-0.015em] text-[color:var(--page-text)] [&_blockquote]:my-8 [&_blockquote]:border-l-2 [&_blockquote]:border-[color:var(--page-highlight)] [&_blockquote]:bg-transparent [&_blockquote]:pl-5 [&_blockquote]:py-2 [&_blockquote]:text-[color:var(--page-muted)] [&_code]:font-code [&_h1]:mb-4 [&_h1]:mt-16 [&_h1]:font-display [&_h1]:text-[28px] [&_h1]:font-normal [&_h1]:leading-[1.35] [&_h2]:mb-4 [&_h2]:mt-16 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-normal [&_h2]:leading-[1.35] [&_h3]:mb-4 [&_h3]:mt-16 [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-normal [&_h3]:leading-[1.35] [&_h4]:mb-4 [&_h4]:mt-16 [&_h4]:font-display [&_h4]:text-xl [&_h4]:font-normal [&_h4]:leading-[1.35] [&_h5]:mb-4 [&_h5]:mt-16 [&_h5]:font-display [&_h5]:text-xl [&_h5]:font-normal [&_h5]:leading-[1.35] [&_h6]:mb-4 [&_h6]:mt-16 [&_h6]:font-display [&_h6]:text-xl [&_h6]:font-normal [&_h6]:leading-[1.35] [&_img]:my-8 [&_img]:w-full [&_li]:mb-2 [&_li]:p-0 [&_ol]:mb-6 [&_ol]:pl-6 [&_p]:mb-5 [&_pre]:my-8 [&_pre]:overflow-auto [&_pre]:border-l-[3px] [&_pre]:border-[color:var(--page-highlight)] [&_pre]:border-y [&_pre]:border-r [&_pre]:border-[color:var(--page-border)] [&_pre]:bg-[color-mix(in_srgb,var(--page-text)_8%,transparent)] [&_pre]:p-5 [&_pre]:shadow-none [&_strong]:text-[color:var(--page-text)] [&_ul]:mb-6 [&_ul]:pl-6 [&_hr]:my-12 [&_hr]:w-full [&_hr]:text-[color:var(--page-border)]'>
          {children}
        </div>
      </article>
    </>
  )
}
