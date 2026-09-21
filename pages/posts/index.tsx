import type { PostMeta } from 'mdx'
import type { InferGetStaticPropsType } from 'next'
import Link from 'next/link'
import { NextSeo } from 'next-seo'

import {
  inlineLinkClassName,
  SectionHeading
} from '@/components/SitePrimitives'
import { formateDatePreview, validDate } from '@/utils/formatDate'
import { getAllPostsMeta } from '@/utils/loadMDX'

export const getStaticProps = async () => {
  const posts = await getAllPostsMeta()
  return { props: { posts } }
}

const PostPreview: React.FC<PostMeta> = ({ slug, title, date }) => {
  return (
    <li className='mb-4 flex items-baseline gap-6 font-body text-[18px] leading-[1.6] text-[color:var(--page-text)] max-[479px]:block'>
      <time
        className='w-[52px] shrink-0 font-ui text-[13px] leading-[1.5] text-[color:var(--page-muted)] max-[479px]:mb-0.5 max-[479px]:block max-[479px]:w-auto'
        dateTime={validDate(date)}>
        {formateDatePreview(date)}
      </time>
      <Link href={`/posts/${slug}`} className={inlineLinkClassName}>
        {title}
      </Link>
    </li>
  )
}

const PostPreviewList: React.FC<{ posts: PostMeta[] }> = ({ posts }) => {
  const postsByYear: Record<string, PostMeta[]> = {}

  for (const post of posts) {
    const year = new Date(post.date).getFullYear()
    const knownPosts = postsByYear[year] || []
    postsByYear[year] = [...knownPosts, post]
  }

  return (
    <div>
      {Object.entries(postsByYear)
        .reverse()
        .map(([year, yearPosts]) => (
          <section key={year} className='mb-12'>
            <h2 className='mb-4 mt-0 block font-ui text-sm font-normal leading-[1.5] text-[color:var(--page-muted)]'>
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

const Posts: React.FC<Props> = ({ posts }) => {
  return (
    <>
      <NextSeo
        title='Posts'
        canonical='https://www.arpit.one/posts'
        openGraph={{ url: 'https://www.arpit.one/posts' }}
      />
      <div className='mx-auto min-h-screen w-[min(600px,calc(100%_-_40px))] py-[8%] text-[color:var(--page-text)] max-lg:pb-20 max-lg:pt-[106px] max-[479px]:pt-24'>
        <SectionHeading
          kicker='Index'
          kickerClassName='mb-4'
          className='mb-16'
          titleClassName='text-[28px] max-[479px]:text-[26px]'>
          Writing
        </SectionHeading>
        <PostPreviewList posts={posts} />
      </div>
    </>
  )
}

export default Posts
