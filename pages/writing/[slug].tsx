import { getMDXComponent } from 'mdx-bundler/client'
import type { GetStaticPropsContext, InferGetStaticPropsType } from 'next'
import { useMemo } from 'react'

import { components } from '@/components/MDXComponents'
import { PostPage } from '@/components/PostPage'
import { getAllPostsMeta, getPost } from '@/utils/loadMDX'

export const getStaticPaths = async () => {
  const posts = await getAllPostsMeta()
  return {
    paths: posts.map(({ slug }) => ({ params: { slug } })),
    fallback: false
  }
}

export const getStaticProps = async (context: GetStaticPropsContext) => {
  const slug = context.params?.slug as string
  return { props: await getPost(slug) }
}

type Props = InferGetStaticPropsType<typeof getStaticProps>

const Post: React.FC<Props> = ({ meta, code }) => {
  const Component = useMemo(() => getMDXComponent(code), [code])

  return (
    <PostPage meta={meta}>
      <Component components={components} />
    </PostPage>
  )
}

export default Post
