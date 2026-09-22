import Head from 'next/head'
import { generateNextSeo } from 'next-seo/pages'

import { Projects } from '@/components/Projects'
import { SectionHeading } from '@/components/SitePrimitives'

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
      <div className='mx-auto min-h-screen w-[min(760px,calc(100%_-_40px))] py-[8%] text-[color:var(--page-text)] max-lg:pb-20 max-lg:pt-[106px] max-[479px]:pt-24'>
        <SectionHeading
          kicker='Projects'
          kickerClassName='mb-4'
          className='mb-16'
          titleClassName='text-[clamp(36px,5vw,56px)] leading-[1.05] tracking-[-0.04em]'>
          Things I have made and kept around.
        </SectionHeading>
        <p className='mb-16 mt-0 max-w-[580px] font-body text-[18px] leading-[1.6] tracking-[-0.015em] text-[color:var(--page-muted)]'>
          A short archive of software, experiments, and research. This page is
          intentionally small for now; it will grow as the projects get better
          documentation.
        </p>
        <Projects />
      </div>
    </>
  )
}

export default ProjectsPage
