import type { ReactElement, ReactNode } from 'react'

import LastPlayed from '@/components/LastPlayed'

export type PageWithLayout = {
  getLayout?: (page: ReactElement) => ReactNode
}

type Props = {
  children: ReactNode
}

const PlaylistsLayout: React.FC<Props> = ({ children }) => {
  return (
    <div className='site-playlists'>
      <LastPlayed />
      {children}
    </div>
  )
}

export default PlaylistsLayout
