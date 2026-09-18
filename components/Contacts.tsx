import { useState } from 'react'

type LinkProps = {
  href: string
  children: React.ReactNode
}

export function Link({ href, children }: LinkProps) {
  return (
    <a
      className='site-inline-link'
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

  const copyEmail = async () => {
    await navigator.clipboard?.writeText('arpitbharti73@gmail.com')
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className='site-contacts'>
      <p>
        {contactList
          .filter(({ name }) => name !== 'Email')
          .map(({ name, href }) => (
            <span key={name}>
              <Link href={href}>{name}</Link>{' '}
            </span>
          ))}
      </p>
      <p>
        <a className='site-inline-link' href='mailto:arpitbharti73@gmail.com'>
          arpitbharti73@gmail.com
        </a>{' '}
        <button type='button' className='site-copy-button' onClick={copyEmail}>
          ({copied ? 'copied' : 'copy'})
        </button>
      </p>
    </div>
  )
}
