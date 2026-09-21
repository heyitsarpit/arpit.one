import { useEffect, useRef, useState } from 'react'

import { inlineLinkClassName } from '@/components/SitePrimitives'

type LinkProps = {
  href: string
  children: React.ReactNode
}

export function Link({ href, children }: LinkProps) {
  return (
    <a
      className={inlineLinkClassName}
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
      <p className='mb-1'>
        {contactList
          .filter(({ name }) => name !== 'Email')
          .map(({ name, href }) => (
            <span key={name}>
              <Link href={href}>{name}</Link>{' '}
            </span>
          ))}
      </p>
      <p className='mb-1'>
        <a
          className={inlineLinkClassName}
          href='mailto:arpitbharti73@gmail.com'>
          arpitbharti73@gmail.com
        </a>{' '}
        <button
          type='button'
          className='border-0 border-b border-dotted border-[color:var(--page-text)] bg-transparent p-0 text-[color:var(--page-text)] transition-colors duration-100 ease-in hover:border-solid hover:border-[color:var(--page-highlight)] hover:text-[color:var(--page-highlight)]'
          onClick={copyEmail}>
          ({copied ? 'copied' : 'copy'})
        </button>
      </p>
    </div>
  )
}
