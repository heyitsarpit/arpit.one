import type { PostMeta } from 'mdx'
import type { InferGetStaticPropsType } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { generateNextSeo } from 'next-seo/pages'

import { focusRingClassName } from '@/components/SitePrimitives'
import { formateDatePreview, validDate } from '@/utils/formatDate'
import { getAllPostsMeta } from '@/utils/loadMDX'

export const getStaticProps = async () => {
  const posts = await getAllPostsMeta()
  return { props: { posts } }
}

const drafts = [
  'the two natures of ai models',
  'why i failed to automate myself',
  'the slop code problem',
  'history will not exist in the future',
  'spontaneous emergence of middle management',
  'source code is not the truth',
  'obsession(2026) is about unaligned general intelligence',
  'Mental models for depression',
  'What is male fashion'
]

const DraftList = () => (
  <section className='mb-16' aria-labelledby='writing-drafts'>
    <h2
      id='writing-drafts'
      className='m-0 mb-5 font-serif text-base font-normal leading-[1.45] text-[color:var(--page-text)]'>
      2026
    </h2>
    <ul className='m-0 list-none p-0'>
      {drafts.map((title) => (
        <li key={title} className='mb-3 font-ui text-base leading-[1.45]'>
          <span>{title}</span>{' '}
          <span className='text-[color:var(--page-muted)]'>
            — under construction
          </span>
        </li>
      ))}
    </ul>
  </section>
)

const PostPreview: React.FC<PostMeta> = ({ slug, title, date }) => (
  <li className='mb-5 last:mb-0'>
    <Link
      href={`/writing/${slug}`}
      className={`group block text-[color:var(--page-text)] no-underline ${focusRingClassName}`}>
      <span className='block font-ui text-base leading-[1.45] transition-colors duration-150 group-hover:text-[color:var(--page-highlight)]'>
        <time
          className='mr-2 text-[color:var(--page-muted)]'
          dateTime={validDate(date)}>
          {formateDatePreview(date)}
        </time>
        <span className='underline-offset-2 group-hover:underline'>
          {title}
          <span
            className='ml-1 inline-block transition-transform duration-150 group-hover:translate-x-0.5'
            aria-hidden='true'>
            →
          </span>
        </span>
      </span>
    </Link>
  </li>
)

const PostPreviewList: React.FC<{ posts: PostMeta[] }> = ({ posts }) => {
  const postsByYear = posts.reduce<Record<string, PostMeta[]>>(
    (years, post) => {
      const year = String(new Date(post.date).getFullYear())
      years[year] = [...(years[year] ?? []), post]
      return years
    },
    {}
  )

  return (
    <div>
      {Object.entries(postsByYear)
        .sort(([a], [b]) => Number(b) - Number(a))
        .map(([year, yearPosts]) => (
          <section
            key={year}
            aria-labelledby={`writing-${year}`}
            className='mb-16'>
            <h2
              id={`writing-${year}`}
              className='m-0 mb-5 font-serif text-base font-normal leading-[1.45] text-[color:var(--page-text)]'>
              {year}
            </h2>
            <ul className='m-0 list-none p-0'>
              {yearPosts.map((post) => (
                <PostPreview key={post.slug} {...post} />
              ))}
            </ul>
          </section>
        ))}
    </div>
  )
}

type Props = InferGetStaticPropsType<typeof getStaticProps>

const Writing: React.FC<Props> = ({ posts }) => (
  <>
    <Head>
      {generateNextSeo({
        title: 'Writing',
        description: 'Notes on software, the web, and things I am learning.',
        canonical: 'https://www.arpit.one/writing',
        openGraph: { url: 'https://www.arpit.one/writing' }
      })}
    </Head>
    <div className='mx-auto min-h-screen w-[min(680px,calc(100%_-_40px))] pb-24 pt-[106px] text-[color:var(--page-text)] lg:py-[8vw]'>
      <header className='mb-16'>
        <h1 className='m-0 font-serif text-[22px] font-normal leading-[1.35]'>
          Writing
        </h1>
      </header>
      <DraftList />
      <PostPreviewList posts={posts} />
    </div>
  </>
)

export default Writing
