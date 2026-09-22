import { actionLinkClassName } from '@/components/SitePrimitives'

export const projects = [
  {
    title: 'React Hooks Library',
    details: `A collection of 30+ react hooks and utilities, also built an accompanying custom documentation website th
  at shows live react demos for all hooks.`,
    live: 'https://react-hooks-library.vercel.app',
    source: 'https://github.com/heyitsarpit/react-hooks-library'
  },
  {
    title: 'arpit.one',
    details: `The website that you're looking at currently.`,
    live: 'https://www.arpit.one/',
    source: 'https://github.com/heyitsarpit/arpit.one'
  },
  {
    title: 'Ad Recommendation on YouTube Videos',
    details: `Senior year research project on the topic of ad recommendation on YouTube videos.
        Analysis of captions to generate product via keyword ranking algorithms. Analysis and comparison
  of string similarity measurement algorithms. Published research paper in Springer.`,
    live: 'https://link.springer.com/chapter/10.1007/978-981-15-8335-3_48',
    source: 'https://github.com/heyitsarpit/ad-recommendation'
  }
]

const SourceIcon = () => (
  <svg
    aria-label='code icon'
    xmlns='http://www.w3.org/2000/svg'
    className='w-3 h-3'
    fill='none'
    viewBox='0 0 24 24'
    stroke='currentColor'>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      d='M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4'
    />
  </svg>
)

const LiveIcon = () => (
  <svg
    aria-label='lightning icon'
    xmlns='http://www.w3.org/2000/svg'
    className='w-3 h-3'
    fill='none'
    viewBox='0 0 24 24'
    stroke='currentColor'>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      d='M13 10V3L4 14h7v7l9-11h-7z'
    />
  </svg>
)

export function Projects() {
  return (
    <ul className='m-0 list-none p-0'>
      {projects.map(({ details, live, source, title }) => (
        <li
          key={title}
          className='mb-14 pl-0 text-[color:var(--page-text)] last:mb-0'>
          <section>
            <div className='flex items-baseline justify-between gap-8 max-[600px]:block'>
              <h2 className='m-0 font-display text-[28px] font-normal leading-[1.1] tracking-[-0.025em]'>
                {title}
              </h2>
              <div className='flex shrink-0 gap-4 max-[600px]:mt-4'>
                {source ? (
                  <a
                    href={source}
                    className={`flex items-center gap-1 text-sm ${actionLinkClassName}`}
                    target='_blank'
                    rel='noopener noreferrer'>
                    <span>source</span>
                    <SourceIcon />
                  </a>
                ) : null}
                {live ? (
                  <a
                    href={live}
                    className={`flex items-center gap-1 text-sm ${actionLinkClassName}`}
                    target='_blank'
                    rel='noopener noreferrer'>
                    <span>live</span>
                    <LiveIcon />
                  </a>
                ) : null}
              </div>
            </div>
            <p className='mb-0 mt-4 max-w-[680px] font-body text-[18px] leading-[1.6] tracking-[-0.015em] text-[color:var(--page-muted)]'>
              {details}
            </p>
          </section>
        </li>
      ))}
    </ul>
  )
}
