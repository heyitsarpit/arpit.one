import Link from 'next/link'
import { useRouter } from 'next/router'
import { type CSSProperties, useState } from 'react'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/posts', label: 'Index' },
  { href: '/art', label: 'Art' },
  { href: '/playlists', label: 'Playlists' }
]

const Nav: React.FC = () => {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const isCurrent = (href: string) =>
    href === '/'
      ? router.pathname === '/'
      : router.pathname === href || router.pathname.startsWith(`${href}/`)
  const activeNavIndex = Math.max(
    navItems.findIndex(({ href }) => isCurrent(href)),
    0
  )
  const navStyle = {
    '--nav-active-offset': `${activeNavIndex * 38}px`
  } as CSSProperties

  return (
    <header className='fixed left-0 top-0 z-50 flex h-[50px] w-full items-center border-b border-[color:var(--page-border)] bg-transparent px-5 text-[color:var(--page-text)] backdrop-blur-lg lg:left-[8vw] lg:top-[8vw] lg:block lg:h-auto lg:w-[100px] lg:border-0 lg:p-0'>
      <nav
        className='relative hidden flex-col items-start lg:flex'
        style={navStyle}
        aria-label='Main navigation'>
        {navItems.map(({ href, label }) => (
          <span key={href} className='flex h-[38px] items-start'>
            <span className='w-4 shrink-0' aria-hidden='true' />
            <Link
              href={href}
              className='mr-1 mb-4 block border-b border-transparent font-ui text-base font-normal leading-[1.4] text-[color:var(--page-text)] no-underline'
              aria-current={isCurrent(href) ? 'page' : undefined}>
              {label}
            </Link>
          </span>
        ))}
        <span
          className='absolute left-1 top-2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[color:var(--page-text)] transition-transform duration-[220ms] ease-linear [transform:translateY(var(--nav-active-offset))]'
          aria-hidden='true'
        />
      </nav>

      <button
        type='button'
        className='flex h-[25px] w-[25px] flex-col items-center justify-between border-0 bg-transparent p-[3px_4px] text-[color:var(--page-text)] lg:hidden'
        aria-expanded={isOpen}
        aria-controls='site-nav-menu'
        aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
        onClick={() => setIsOpen((open) => !open)}>
        <span />
        <span />
        <span />
      </button>

      {isOpen ? (
        <nav
          id='site-nav-menu'
          className='absolute left-0 top-[50px] flex w-full flex-col items-start border-t border-[color:var(--page-border)] bg-[color:var(--page-background)] px-5 pb-2 pl-10 pt-1 lg:hidden'
          aria-label='Main navigation'>
          {navItems.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className='mr-1 mb-4 block border-b border-transparent font-ui text-base font-normal leading-[1.4] text-[color:var(--page-text)] no-underline'
              aria-current={isCurrent(href) ? 'page' : undefined}
              onClick={() => setIsOpen(false)}>
              {label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  )
}

export default Nav
