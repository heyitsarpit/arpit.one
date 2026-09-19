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
    <header className='site-nav'>
      <nav
        className='site-nav-desktop'
        style={navStyle}
        aria-label='Main navigation'>
        {navItems.map(({ href, label }) => (
          <span key={href} className='site-nav-item'>
            <span className='site-nav-bullet-space' aria-hidden='true' />
            <Link
              href={href}
              className='site-nav-link'
              aria-current={isCurrent(href) ? 'page' : undefined}>
              {label}
            </Link>
          </span>
        ))}
        <span className='site-nav-active-dot' aria-hidden='true' />
      </nav>

      <button
        type='button'
        className='site-nav-toggle'
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
          className='site-nav-menu'
          aria-label='Main navigation'>
          {navItems.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className='site-nav-link'
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
