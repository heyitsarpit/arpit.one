import fs from 'node:fs'
import path from 'node:path'
import { getMDXComponent } from 'mdx-bundler/client'
import type { InferGetStaticPropsType } from 'next'
import { useMemo } from 'react'

import { Contacts } from '@/components/Contacts'
import { components } from '@/components/MDXComponents'
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
  Contacts,
  Spacer
}

type Props = InferGetStaticPropsType<typeof getStaticProps>

export default function Home({ code }: Props) {
  const Component = useMemo(() => getMDXComponent(code), [code])

  return (
    <article className='mx-auto flex min-h-screen w-[min(680px,calc(100%_-_40px))] flex-col pb-24 pt-[106px] text-[color:var(--page-text)] lg:py-[8vw]'>
      <Component components={mdxComponents} />
    </article>
  )
}
