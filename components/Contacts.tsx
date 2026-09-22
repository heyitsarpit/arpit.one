import { useEffect, useRef, useState } from 'react'

import { focusRingClassName } from '@/components/SitePrimitives'

const homeLinkClassName = `site-home-link inline-block border-x-0 border-t-0 bg-transparent p-0 ${focusRingClassName}`

type LinkProps = {
  href: string
  children: React.ReactNode
}

export function Link({ href, children }: LinkProps) {
  return (
    <a
      className={homeLinkClassName}
      rel='noopener noreferrer'
      target='_blank'
      href={href}>
      {children}
    </a>
  )
}

const contactList = [
  {
    name: 'Github',
    href: 'https://github.com/heyitsarpit/'
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/arpitbharti/'
  },
  {
    name: 'Email',
    href: 'mailto:arpitbharti73@gmail.com?subject=Hey%20Arpit'
  },
  {
    name: 'Twitter',
    href: 'https://twitter.com/heyitsarpit'
  },
  {
    name: 'Substack',
    href: 'https://runningdownslopes.substack.com'
  }
]

export function Contacts() {
  const [copied, setCopied] = useState(false)
  const copyResetTimeout = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (copyResetTimeout.current !== null) {
        window.clearTimeout(copyResetTimeout.current)
      }
    }
  }, [])

  const copyEmail = async () => {
    await navigator.clipboard?.writeText('arpitbharti73@gmail.com')
    setCopied(true)
    if (copyResetTimeout.current !== null) {
      window.clearTimeout(copyResetTimeout.current)
    }
    copyResetTimeout.current = window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className='mt-6'>
      <p className='mb-2 flex flex-wrap gap-x-5 gap-y-2'>
        {contactList
          .filter(({ name }) => name !== 'Email')
          .map(({ name, href }) => (
            <Link key={name} href={href}>
              {name}
            </Link>
          ))}
      </p>
      <p className='mb-1'>
        <a className={homeLinkClassName} href='mailto:arpitbharti73@gmail.com'>
          arpitbharti73@gmail.com
        </a>{' '}
        <button type='button' className={homeLinkClassName} onClick={copyEmail}>
          ({copied ? 'copied' : 'copy'})
        </button>
      </p>
    </div>
  )
}
