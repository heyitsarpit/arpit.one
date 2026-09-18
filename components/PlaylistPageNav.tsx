import Link from 'next/link'

type Props = {
  active: 'playlists' | 'albums' | 'stats'
}

const tabs = [
  { href: '/playlists', label: 'Playlists', key: 'playlists' },
  { href: '/playlists/albums', label: 'Albums', key: 'albums' },
  { href: '/playlists/stats', label: 'Stats', key: 'stats' }
] as const

const PlaylistPageNav: React.FC<Props> = ({ active }) => {
  return (
    <nav className='site-playlists-page-nav' aria-label='Playlist pages'>
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          aria-current={active === tab.key ? 'page' : undefined}>
          {tab.label}
        </Link>
      ))}
    </nav>
  )
}

export default PlaylistPageNav
