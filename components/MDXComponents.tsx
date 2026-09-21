import Link from 'next/link'
import type { ImgHTMLAttributes } from 'react'

import { inlineLinkClassName } from '@/components/SitePrimitives'

const reg = /http|https/

export const components = {
  a: ({ href = '', ...props }) => {
    if (href.match(reg)) {
      return (
        <a
          href={href}
          className={inlineLinkClassName}
          target='_blank'
          rel='noopener noreferrer'
          {...props}
        />
      )
    }
    return <Link href={href} className={inlineLinkClassName} {...props} />
  },
  img: ({
    alt = '',
    className,
    ...props
  }: ImgHTMLAttributes<HTMLImageElement>) => (
    <div className='my-10 overflow-hidden'>
      {/* biome-ignore lint/performance/noImgElement: MDX images are arbitrary external URLs and do not provide dimensions for next/image. */}
      <img
        {...props}
        className={className}
        alt={alt}
        loading='lazy'
        decoding='async'
      />
    </div>
  )
}
