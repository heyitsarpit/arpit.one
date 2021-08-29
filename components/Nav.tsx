import Link from 'next/link';
import { useRouter } from 'next/router';

import ThemeSwitch from './ThemeSwitch';

const Nav: React.FC = () => {
  const router = useRouter();

  const isActive = (pathname) => {
    return router.asPath.includes(pathname);
  };

  return (
    <header className="relative w-full h-16">
      <div className="fixed h-16 z-40 w-full flex justify-between backdrop-blur-[20px] backdrop-saturate-150 bg-white/50 dark:bg-black/50">
        <nav className="w-full sm:max-w-[75ch] m-auto flex px-5 justify-between items-center dark:text-white">
          <Link href="/" passHref>
            <a title="Home" aria-label="Home">
              ARPIT
            </a>
          </Link>
          <div className="flex items-center gap-10">
            {['/posts', '/art'].map((path) => (
              <Link key={path} href={path}>
                <a className={`capitalize ${isActive(path) ? '' : 'opacity-50'}`}>
                  {path.replace('/', '')}
                </a>
              </Link>
            ))}

            <ThemeSwitch />
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Nav;
