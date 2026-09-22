import { focusRingClassName } from '@/components/SitePrimitives'

export const projects = [
  {
    title: 'flow-state [under construction]',
    details:
      'A react state management library and co-framework that offers a range of extra tooling when building large react apps.',
    live: 'https://github.com/heyitsarpit/flow-state'
  },
  {
    title: 'anti-slop [under construction]',
    details:
      'My collection of typescript + effect.ts focused oxlint rules to improve agent written code quality.',
    live: 'https://github.com/heyitsarpit/flow-state'
  },
  {
    title: 'workflow [under construction]',
    details:
      'my intended workflow with skills and procedures for planning, building and shipping projects with agents.',
    live: 'https://github.com/heyitsarpit/flow-state'
  },
  {
    title: 'React Hooks Library',
    details:
      'A collection of more than 30 React hooks, with documentation and live examples.',
    live: 'https://react-hooks-library.vercel.app'
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
