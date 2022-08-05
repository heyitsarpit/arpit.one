import { InferGetStaticPropsType } from 'next';
import Link from 'next/link';
import { NextSeo } from 'next-seo';

import { formateDatePreview, validDate } from '@/utils/formatDate';
import { getAllPostsMeta } from '@/utils/loadMDX';

export const getStaticProps = async () => {
  const posts = await getAllPostsMeta();
  return { props: { posts } };
};

const PostPreview: React.FC<PostMeta> = ({ slug, title, date }) => {
  return (
    <li className="flex items-center p-1 my-8">
      <p className="text-sm mr-8 min-w-[50px]">
        <time dateTime={validDate(date)}>{formateDatePreview(date)}</time>
      </p>
      <Link href={`posts/${slug}`}>
        <a className="font-light capitalize transition-colors duration-200 rounded outline-none link-btn">
          {title}
        </a>
      </Link>
    </li>
  );
};

const PostPreviewList: React.FC<{ posts: PostMeta[] }> = ({ posts }) => {
  const postsByYear: Record<string, PostMeta[]> = {};

  posts.forEach((post) => {
    const year = new Date(post.date).getFullYear();
    const knownPosts = postsByYear[year] || [];
    postsByYear[year] = [...knownPosts, post];
  });

  return (
    <>
      {Object.entries(postsByYear)
        .reverse()
        .map(([year, posts]) => (
          <div key={year} className="w-full">
            <h2 className="pl-1 text-lg font-semibold">{year}</h2>
            <ul>
              {posts.map((post) => (
                <PostPreview key={post.slug} {...post} />
              ))}
            </ul>
          </div>
        ))}
    </>
  );
};

type Props = InferGetStaticPropsType<typeof getStaticProps>;

const Posts: React.FC<Props> = ({ posts }) => {
  return (
    <>
      <NextSeo
        title="Posts"
        canonical="https://www.arpit.one/posts"
        openGraph={{ url: 'https://www.arpit.one/posts' }}
      />
      <div className="sm:max-w-[75ch] m-auto px-5 py-16 flex flex-col justify-center items-center">
        <PostPreviewList posts={posts} />
      </div>
    </>
  );
};

export default Posts;
