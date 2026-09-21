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
    <nav
      className='flex items-center justify-end gap-5 font-ui text-base leading-[1.4] max-[479px]:gap-4'
      aria-label='Playlist pages'>
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          className='border-b border-transparent text-[color:var(--page-text)] no-underline hover:border-[color:var(--page-highlight)] aria-[current=page]:border-[color:var(--page-highlight)]'
          aria-current={active === tab.key ? 'page' : undefined}>
          {tab.label}
        </Link>
      ))}
    </nav>
  )
}

export default PlaylistPageNav
