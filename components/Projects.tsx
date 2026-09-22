import { focusRingClassName } from '@/components/SitePrimitives'

export const projects = [
  {
    title: 'React Hooks Library',
    details:
      'A collection of more than 30 React hooks, with documentation and live examples.',
    live: 'https://react-hooks-library.vercel.app'
  },
  {
    title: 'arpit.one',
    details: 'The personal website you are looking at now.',
    live: 'https://www.arpit.one/'
  },
  {
    title: 'Ad Recommendation on YouTube Videos',
    details:
      'A published research project using captions and string-similarity algorithms to recommend products for videos.',
    live: 'https://link.springer.com/chapter/10.1007/978-981-15-8335-3_48'
  }
]

export function Projects() {
  return (
    <section aria-label='Projects'>
      <ul className='m-0 list-none p-0'>
        {projects.map(({ details, live, title }) => (
          <li key={title} className='mb-8 pl-0 last:mb-0'>
            <div className='font-ui text-base leading-[1.45]'>
              <a
                href={live}
                className={`text-[color:var(--page-text)] no-underline underline-offset-2 transition-colors duration-150 hover:text-[color:var(--page-highlight)] hover:underline ${focusRingClassName}`}
                target='_blank'
                rel='noopener noreferrer'>
                {title} <span aria-hidden='true'>↗</span>
              </a>
            </div>
            <p className='mb-0 mt-0.5 max-w-[58ch] font-ui text-base leading-[1.45] text-[color:var(--page-muted)]'>
              {details}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
