import type { ReactNode } from 'react'

type HeadingTag = 'h1' | 'h2'

type SectionHeadingProps = {
  as?: HeadingTag
  children: ReactNode
  className?: string
  id?: string
  kicker?: ReactNode
  kickerClassName?: string
  titleClassName?: string
}

export const inlineLinkClassName =
  'text-[color:var(--page-text)] no-underline border-b border-dotted border-[color:var(--page-text)] transition-colors duration-100 ease-in hover:text-[color:var(--page-highlight)] hover:border-[color:var(--page-highlight)] hover:border-solid'

export const actionLinkClassName =
  'h-max rounded-sm bg-transparent px-1 font-medium text-[color:var(--page-text)] transition-colors duration-150 ease-linear hover:bg-transparent hover:text-[color:var(--page-highlight)] focus:bg-transparent focus:text-[color:var(--page-highlight)]'

export const solidActionLinkClassName =
  'h-max rounded-sm bg-[color:var(--page-muted)] px-1 font-medium text-[color:var(--page-text)] transition-colors duration-150 ease-linear hover:bg-[color:var(--page-highlight)] hover:text-[color:var(--page-background)] focus:bg-[color:var(--page-highlight)] focus:text-[color:var(--page-background)]'

export const focusRingClassName =
  'focus-visible:outline-2 focus-visible:outline-[color:var(--page-highlight)] focus-visible:outline-offset-2'

export function SectionHeading({
  as = 'h1',
  children,
  className = '',
  id,
  kicker,
  kickerClassName = 'mb-2',
  titleClassName = ''
}: SectionHeadingProps) {
  const Heading = as

  return (
    <div className={className}>
      {kicker ? (
        <p
          className={`m-0 font-ui text-sm leading-[1.5] text-[color:var(--page-muted)] ${kickerClassName}`}>
          {kicker}
        </p>
      ) : null}
      <Heading
        id={id}
        className={`m-0 block font-display text-[28px] font-normal leading-[1.35] tracking-normal text-[color:var(--page-text)] ${titleClassName}`}>
        {children}
      </Heading>
    </div>
  )
}

type StatusMessageProps = {
  children: ReactNode
  className?: string
}

export function StatusMessage({
  children,
  className = ''
}: StatusMessageProps) {
  return (
    <p
      className={`m-0 font-ui text-[13px] leading-[1.6] text-[color:var(--page-muted)] ${className}`}>
      {children}
    </p>
  )
}
