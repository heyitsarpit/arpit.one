type LinkProps = {
  href: string;
  children: React.ReactNode;
};

export function Link({ href, children }: LinkProps) {
  return (
    <a className="px-2 py-1 link-btn" rel="noopener noreferrer" target="_blank" href={href}>
      {children}
    </a>
  );
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
];

export function Contacts() {
  return (
    <div className="flex flex-wrap gap-2">
      {contactList.map(({ name, href }) => (
        <Link key={name} href={href}>
          {name}
        </Link>
      ))}
    </div>
  );
}
