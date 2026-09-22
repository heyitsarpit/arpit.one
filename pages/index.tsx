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
    <article className='mx-auto box-border flex min-h-screen max-w-[600px] flex-col px-5 pb-[9%] pt-[8%] text-[color:var(--page-text)] max-lg:pb-[16%] max-lg:pt-[18%] max-md:pb-[12%] max-[479px]:pb-[16%] max-[479px]:pt-[30%]'>
      <Component components={mdxComponents} />
    </article>
  )
}
