import fs from 'node:fs'
import path from 'node:path'
import { getMDXComponent } from 'mdx-bundler/client'
import type { InferGetStaticPropsType } from 'next'
import { useMemo } from 'react'

import { Contacts } from '@/components/Contacts'
import { Experience } from '@/components/Experience'
import { HomeImageRail } from '@/components/HomeImageRail'
import { components } from '@/components/MDXComponents'
import { Projects } from '@/components/Projects'
import { Spacer } from '@/components/Spacer'
import { loadMDX } from '@/utils/loadMDX'

export const getStaticProps = async () => {
  const file = path.resolve(process.cwd(), 'content', 'home.mdx')
  const source = fs.readFileSync(file, 'utf-8')

  const { code } = await loadMDX(source)

  return { props: { code } }
}

const mdxComponents = {
  ...components,
  Experience,
  Projects,
  Contacts,
  HomeImageRail,
  Spacer
}

type Props = InferGetStaticPropsType<typeof getStaticProps>

export default function Home({ code }: Props) {
  const Component = useMemo(() => getMDXComponent(code), [code])

  return (
    <article className='site-home'>
      <Component components={mdxComponents} />
    </article>
  )
}
