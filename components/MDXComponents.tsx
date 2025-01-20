import Link from 'next/link'

const reg = /http|https/

export const components = {
  a: ({ href = '', ...props }) => {
    if (href.match(reg)) {
      return (
        <a
          href={href}
          className='link-btn'
          target='_blank'
          rel='noopener noreferrer'
          {...props}
        />
      )
    }
    return <Link href={href} {...props} />
  },
  img: ({ ...props }: { children: React.ReactNode }) => (
    <div className='my-10'>
      {/* biome-ignore lint/suspicious/noExplicitAny: <explanation> */}
      <img {...(props as any)} layout='fill' alt='' />
    </div>
  )
}
