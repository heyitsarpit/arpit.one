import Link from 'next/link'
import { useRouter } from 'next/router'
import { type CSSProperties, useEffect, useState } from 'react'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/writing', label: 'Writing' },
  { href: '/projects', label: 'Projects' },
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

  useEffect(() => {
    if (!isOpen) return

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [isOpen])

  return (
    <header
      className={`site-nav-shell fixed left-0 top-0 z-50 flex h-[50px] w-full items-center border-b border-[color:var(--page-border)] bg-[color-mix(in_srgb,var(--page-background)_88%,transparent)] px-5 text-[color:var(--page-text)] lg:block lg:h-auto lg:w-[100px] lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none ${isOpen ? 'backdrop-blur-none' : 'backdrop-blur-lg'}`}>
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
        className='ml-auto flex h-9 w-9 flex-col items-center justify-center gap-[6px] border-0 bg-transparent p-2 text-[color:var(--page-text)] lg:hidden'
        aria-expanded={isOpen}
        aria-controls='site-nav-menu'
        aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
        onClick={() => setIsOpen((open) => !open)}>
        <span
          className={`block h-px w-full bg-current transition-transform duration-200 ${isOpen ? 'translate-y-[7px] rotate-45' : ''}`}
          aria-hidden='true'
        />
        <span
          className={`block h-px w-full bg-current transition-opacity duration-150 ${isOpen ? 'opacity-0' : ''}`}
          aria-hidden='true'
        />
        <span
          className={`block h-px w-full bg-current transition-transform duration-200 ${isOpen ? '-translate-y-[7px] -rotate-45' : ''}`}
          aria-hidden='true'
        />
      </button>

      {isOpen ? (
        <nav
          id='site-nav-menu'
          className='absolute left-0 top-[49px] flex max-h-[calc(100vh_-_49px)] w-full flex-col items-start overflow-y-auto border-t border-[color:var(--page-border)] bg-[color-mix(in_srgb,var(--page-background)_62%,transparent)] px-5 py-4 shadow-[0_18px_36px_color-mix(in_srgb,var(--page-text)_8%,transparent)] backdrop-blur-[12px] lg:hidden'
          aria-label='Main navigation'>
          {navItems.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className='block w-full py-2.5 font-ui text-base font-normal leading-[1.4] text-[color:var(--page-text)] no-underline'
              aria-current={isCurrent(href) ? 'page' : undefined}
              onClick={() => setIsOpen(false)}>
              <span className='inline-flex items-center gap-3'>
                <span
                  className={`h-1.5 w-1.5 rounded-full bg-current ${isCurrent(href) ? 'opacity-100' : 'opacity-0'}`}
                  aria-hidden='true'
                />
                {label}
              </span>
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  )
}

export default Nav
