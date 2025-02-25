import Link from 'next/link'

import { a11yDate, visibleDate } from '@/utils/date'

const experience = [
  {
    company: 'Everclear',
    location: 'remote',
    position: 'Senior Frontend Developer',
    link: 'https://www.everclear.org/',
    startDate: 'may 10, 2024',
    endDate: 'now',
    details: 'Leading frontend efforts at Everclear.'
  },
  {
    company: 'Rage Trade',
    location: 'remote',
    position: 'Senior Frontend Developer',
    link: 'https://www.rage.trade/',
    startDate: 'november 1, 2021',
    endDate: 'may 9, 2024',
    details:
      'Built and scaled a cross chain perpetual swap aggregation platform to $1B+ in Volume'
  },
  {
    company: 'Antillia',
    location: 'remote',
    link: 'https://www.antillia.ai/',
    position: 'Fullstack Developer',
    startDate: 'november 1, 2020',
    endDate: 'november 1, 2021',
    details:
      'Building customizable video chat applications, similar to zoom or google meet.'
  },
  {
    company: 'QuillHash',
    location: 'remote',
    link: 'https://www.quillhash.com/',
    position: 'Fullstack Developer',
    startDate: 'June 16, 2020',
    endDate: 'October 29, 2020',
    details:
      'Maintainer of the backend and web app for zeptagram, a crypto enabled music service.'
  },
  {
    company: 'Mozilla',
    location: 'remote',
    link: 'https://summerofcode.withgoogle.com/archive/2019/projects/5922077838671872',
    position: 'Google Summer of Code Intern',
    startDate: 'June 1, 2019',
    endDate: 'September 03, 2019',
    details: (
      <>
        Proposed and developed system to auto update firefox public suffix list.
        Successfully delivered in firefox 70.{' '}
        <Link href='/posts/gsoc-2019' className='link-btn'>
          All my work is public and open source.
        </Link>
      </>
    )
  }
  // {
  //   company: 'Splisys',
  //   location: 'Delhi',
  //   position: 'Blockchain Research Intern',
  //   startDate: 'June 1, 2018',
  //   endDate: 'August 29, 2018',
  //   details:
  //     'Solved problems of demurrage claims in the oil shipping industry with the help of ethereum smart contracts'
  // }
]

export function Experience() {
  return (
    <ul>
      {experience.map(({ company, details, endDate, position, startDate }) => (
        <li
          key={company}
          className='pb-2 pl-0 mb-4 border-b dark:border-stone-900 border-stone-200 before:contents'>
          <section>
            <h3 className='m-0 text-base font-normal'>{position}</h3>
            <div className='flex justify-between text-sm text-stone-600 dark:text-stone-400 '>
              <div>{company}</div>
              <div>
                <time dateTime={a11yDate(startDate)}>
                  {visibleDate(startDate)}
                </time>
                {' - '}
                <time dateTime={a11yDate(endDate)}>{visibleDate(endDate)}</time>
              </div>
            </div>

            <p className='mt-4 text-sm'>{details}</p>
          </section>
        </li>
      ))}
    </ul>
  )
}
