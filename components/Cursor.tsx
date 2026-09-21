import { BreakPointHooks, breakpointsTailwind } from '@react-hooks-library/core'
import { useEffect, useRef } from 'react'

const { useSmaller } = BreakPointHooks(breakpointsTailwind)

export function Cursor() {
  const ref = useRef<HTMLDivElement>(null)
  const isMobile = useSmaller('md')

  useEffect(() => {
    const previousBodyCursor = document.body.style.cursor

    if (isMobile) {
      document.body.style.cursor = 'auto'
      return () => {
        document.body.style.cursor = previousBodyCursor
      }
    }

    document.body.style.cursor = 'none'

    const handleMouseEnter = () => {
      if (!ref.current) return

      ref.current.style.width = '4rem'
      ref.current.style.height = '4rem'

      ref.current.style.setProperty('--tw-translate-x', '-2rem')
      ref.current.style.setProperty('--tw-translate-y', '-2rem')
    }

    const handleMouseLeave = () => {
      if (!ref.current) return

      ref.current.style.width = '2rem'
      ref.current.style.height = '2rem'

      ref.current.style.setProperty('--tw-translate-x', '-1rem')
      ref.current.style.setProperty('--tw-translate-y', '-1rem')
    }

    // called to reset to default position

    const interactiveSelector =
      'a, button, input, textarea, [data-clickable="true"]'

    const handlePointerOver = (event: PointerEvent) => {
      if (!(event.target instanceof Element)) return

      const interactive = event.target.closest(interactiveSelector)
      const related =
        event.relatedTarget instanceof Node ? event.relatedTarget : null

      if (interactive && (!related || !interactive.contains(related))) {
        handleMouseEnter()
      }
    }

    const handlePointerOut = (event: PointerEvent) => {
      if (!(event.target instanceof Element)) return

      const interactive = event.target.closest(interactiveSelector)
      const related =
        event.relatedTarget instanceof Node ? event.relatedTarget : null

      if (interactive && (!related || !interactive.contains(related))) {
        handleMouseLeave()
      }
    }

    let lastScrollX = 0
    let lastScrollY = 0
    let lastPageX = 0
    let lastPageY = 0

    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current) return

      ref.current.style.left = `${e.pageX}px`
      ref.current.style.top = `${e.pageY}px`

      lastScrollX = window.scrollX
      lastScrollY = window.scrollY

      lastPageX = e.pageX
      lastPageY = e.pageY
    }

    const handleScroll = () => {
      if (!ref.current) return

      const scrollDistanceX = window.scrollX - lastScrollX
      const scrollDistanceY = window.scrollY - lastScrollY

      ref.current.style.left = `${lastPageX + scrollDistanceX}px`
      ref.current.style.top = `${lastPageY + scrollDistanceY}px`
    }

    const handleWindowEnter = () => {
      if (!ref.current) return
      ref.current.style.visibility = 'visible'
    }
    const handleWindowLeave = () => {
      if (!ref.current) return
      ref.current.style.visibility = 'hidden'
    }

    //////////////////////////////////////////////////////////////////

    handleMouseLeave()

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('scroll', handleScroll)
    document.addEventListener('pointerover', handlePointerOver)
    document.addEventListener('pointerout', handlePointerOut)

    document.documentElement.addEventListener('mouseenter', handleWindowEnter)
    document.documentElement.addEventListener('mouseleave', handleWindowLeave)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('pointerover', handlePointerOver)
      document.removeEventListener('pointerout', handlePointerOut)

      document.documentElement.removeEventListener(
        'mouseenter',
        handleWindowEnter
      )
      document.documentElement.removeEventListener(
        'mouseleave',
        handleWindowLeave
      )
      document.body.style.cursor = previousBodyCursor
    }
  }, [isMobile])

  return (
    <div className='hidden md:block min-w-max'>
      <div
        ref={ref}
        style={{ transitionProperty: 'height, width, transform' }}
        className='absolute top-0 left-0 w-8 h-8 z-[200] duration-150 -translate-x-4 -translate-y-4 border-2 rounded-full pointer-events-none border-stone-800 dark:border-stone-200 ring-1 ring-stone-200 dark:ring-stone-800 bg-gray-400/20 flex justify-center items-center'>
        <div className='w-2 h-2 rounded-full bg-stone-800 dark:bg-stone-200 ring-1 ring-stone-200 dark:ring-stone-800' />
      </div>
    </div>
  )
}
