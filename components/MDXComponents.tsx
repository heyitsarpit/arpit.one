import Link from 'next/link';

export const components = {
  a: ({ href = '', ...props }) => {
    if (href.match(/http|https/)) {
      return (
        <a href={href} className="link-btn" target="_blank" rel="noopener noreferrer" {...props} />
      );
    }
    return (
      <Link href={href} className="link-btn" {...props} />
    );
  },
  img: ({ ...props }: { children: React.ReactNode }) => (
    <div className="my-10">
      <img {...(props as any)} layout="fill" alt="" />
    </div>
  )
};
