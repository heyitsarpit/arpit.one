import Link from 'next/link';

import { a11yDate, visibleDate } from '@/utils/date';

const experience = [
  {
    company: 'Rage Trade',
    location: 'remote',
    position: 'Frontend Developer',
    link: 'https://www.rage.trade/',
    startDate: 'november 1, 2021',
    endDate: 'now',
    details: 'Building a perpetual swaps trading and staking platform on uniswap v3.'
  },
  {
    company: 'Antillia',
    location: 'remote',
    link: 'https://www.antillia.ai/',
    position: 'Fullstack Developer',
    startDate: 'november 1, 2020',
    endDate: 'november 1, 2021',
    details: 'Building customizable video chat applications, similar to zoom or google meet.'
  },
  {
    company: 'QuillHash',
    location: 'remote',
    link: 'https://www.quillhash.com/',
    position: 'Fullstack Developer',
    startDate: 'June 16, 2020',
    endDate: 'October 29, 2020',
    details: 'Maintainer of the backend and web app for zeptagram, a crypto enabled music service.'
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
        Proposed and developed system to auto update firefox public suffix list. Successfully
        delivered in firefox 70.{' '}
        <Link href="/posts/gsoc-2019">
          <a className="link-btn">All my work is public and open source.</a>
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
];

export function Experience() {
  return (
    <ul>
      {experience.map(({ company, details, endDate, position, startDate, link }) => (
        <li
          key={company}
          className="pb-2 pl-0 mb-4 border-b dark:border-warmGray-900 border-warmGray-200 before:contents">
          <section>
            <div className="flex justify-between">
              <h3 className="m-0 text-base font-normal">{position}</h3>

              <a href={link} className="text-sm link-btn" rel="noopener noreferrer" target="_blank">
                {company}
              </a>
            </div>

            <div className="text-xs text-warmGray-600 dark:text-warmGray-400 ">
              <time dateTime={a11yDate(startDate)}>{visibleDate(startDate)}</time>
              {' - '}
              <time dateTime={a11yDate(endDate)}>{visibleDate(endDate)}</time>
            </div>

            <p className="mt-4 text-sm">{details}</p>
          </section>
        </li>
      ))}
    </ul>
  );
}
