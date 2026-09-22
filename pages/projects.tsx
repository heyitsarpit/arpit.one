import Head from 'next/head'
import { generateNextSeo } from 'next-seo/pages'

import { Projects } from '@/components/Projects'

const ProjectsPage: React.FC = () => {
  return (
    <>
      <Head>
        {generateNextSeo({
          title: 'Projects',
          canonical: 'https://www.arpit.one/projects',
          openGraph: { url: 'https://www.arpit.one/projects' }
        })}
      </Head>
      <div className='mx-auto min-h-screen w-[min(680px,calc(100%_-_40px))] pb-24 pt-[106px] text-[color:var(--page-text)] lg:py-[8vw]'>
        <header className='mb-16'>
          <h1 className='m-0 font-serif text-[22px] font-normal leading-[1.35]'>
            Projects
          </h1>
        </header>
        <Projects />
      </div>
    </>
  )
}

export default ProjectsPage
