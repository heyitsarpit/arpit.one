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
    <div className='box-border min-h-screen max-w-[1120px] py-[8vw] pb-[10vw] pl-0 pr-0 text-[color:var(--page-text)] ml-[max(150px,calc(8vw+120px))] mr-[6vw] max-lg:mx-auto max-lg:w-[calc(100%_-_40px)] max-lg:max-w-none max-lg:pb-20 max-lg:pt-[106px]'>
      <LastPlayed />
      {children}
    </div>
  )
}

export default PlaylistsLayout
