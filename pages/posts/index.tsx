import type { InferGetStaticPropsType } from 'next'
import { NextSeo } from 'next-seo'
import Link from 'next/link'

import { formateDatePreview, validDate } from '@/utils/formatDate'
import { getAllPostsMeta } from '@/utils/loadMDX'
import type { PostMeta } from 'mdx'

export const getStaticProps = async () => {
  const posts = await getAllPostsMeta()
  return { props: { posts } }
}

const PostPreview: React.FC<PostMeta> = ({ slug, title, date }) => {
  return (
    <li className='site-post-row'>
      <time className='site-post-date' dateTime={validDate(date)}>
        {formateDatePreview(date)}
      </time>
      <Link href={`/posts/${slug}`} className='site-inline-link'>
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
    <div className='site-post-list'>
      {Object.entries(postsByYear)
        .reverse()
        .map(([year, yearPosts]) => (
          <section key={year} className='site-post-year'>
            <h2>{year}</h2>
            <ul>
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
      <div className='site-posts'>
        <p className='site-section-kicker'>Index</p>
        <h1 className='site-section-title'>Writing</h1>
        <PostPreviewList posts={posts} />
      </div>
    </>
  )
}

export default Posts
