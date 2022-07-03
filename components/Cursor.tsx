import { useRouter } from 'next/router';
import { useLayoutEffect as useEffect, useRef } from 'react';

export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const { route } = useRouter();

  useEffect(() => {
    document.body.style.cursor = 'none';

    const handleMouseEnter = () => {
      if (!ref.current) return;

      ref.current.style.width = '4rem';
      ref.current.style.height = '4rem';

      ref.current.style.setProperty('--tw-translate-x', '-2rem');
      ref.current.style.setProperty('--tw-translate-y', '-2rem');
    };

    const handleMouseLeave = () => {
      if (!ref.current) return;

      ref.current.style.width = '2rem';
      ref.current.style.height = '2rem';

      ref.current.style.setProperty('--tw-translate-x', '-1rem');
      ref.current.style.setProperty('--tw-translate-y', '-1rem');
    };

    // called to reset to default position

    const allLinks = Array.from(
      document.querySelectorAll('a, button, input, textarea, [data-clickable="true"]')
    );

    const handleLinks = () => {
      allLinks.map((link) => {
        link.setAttribute('style', 'cursor: none;');

        link.addEventListener('mouseenter', handleMouseEnter);
        link.addEventListener('mouseleave', handleMouseLeave);
      });
    };

    const unHandleLinks = () => {
      allLinks.map((link) => {
        link.setAttribute('style', 'cursor: auto;');

        link.removeEventListener('mouseenter', handleMouseEnter);
        link.removeEventListener('mouseleave', handleMouseLeave);
      });
    };

    let lastScrollX = 0;
    let lastScrollY = 0;
    let lastPageX = 0;
    let lastPageY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current) return;

      ref.current.style.left = `${e.pageX}px`;
      ref.current.style.top = `${e.pageY}px`;

      lastScrollX = window.scrollX;
      lastScrollY = window.scrollY;

      lastPageX = e.pageX;
      lastPageY = e.pageY;
    };

    const handleScroll = () => {
      if (!ref.current) return;

      const scrollDistanceX = window.scrollX - lastScrollX;
      const scrollDistanceY = window.scrollY - lastScrollY;

      ref.current.style.left = `${lastPageX + scrollDistanceX}px`;
      ref.current.style.top = `${lastPageY + scrollDistanceY}px`;
    };

    //////////////////////////////////////////////////////////////////

    handleMouseLeave();
    handleLinks();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);

      unHandleLinks();
    };
  }, [route]);

  return (
    <div
      ref={ref}
      style={{ transitionProperty: 'height, width, transform' }}
      className="absolute top-0 left-0 w-8 h-8 z-[200] duration-150 -translate-x-4 -translate-y-4 border-2 rounded-full pointer-events-none border-warmGray-800 dark:border-warmGray-200 ring-1 ring-warmGray-200 dark:ring-warmGray-800 bg-gray-400/20 flex justify-center items-center">
      <div className="w-2 h-2 rounded-full bg-warmGray-800 dark:bg-warmGray-200 ring-1 ring-warmGray-200 dark:ring-warmGray-800"></div>
    </div>
  );
}
