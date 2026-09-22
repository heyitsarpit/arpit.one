import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'

import { StatusMessage } from '@/components/SitePrimitives'

type Track = {
  title: string
  artists: string[]
  album: string
  image: string
  url: string
  playedAt: string
}

type ApiState = {
  configured: boolean
  track: Track | null
  error?: string
}

const fetchRecentlyPlayed = async (): Promise<ApiState> => {
  const response = await fetch('/api/spotify/recently-played')
  const payload = (await response.json()) as ApiState

  if (!response.ok && payload.configured !== false) {
    throw new Error(payload.error || 'Spotify history could not be loaded.')
  }

  return payload
}

const LastPlayed: React.FC = () => {
  const {
    data: state,
    error,
    isPending
  } = useQuery({
    queryKey: ['spotify', 'recently-played'],
    queryFn: fetchRecentlyPlayed,
    refetchInterval: 5 * 60 * 1000,
    staleTime: 60 * 1000
  })

  const track = state?.track
  const errorMessage = state?.error || error?.message

  return (
    <aside
      className='relative mb-16 grid min-h-[152px] grid-cols-[150px_minmax(0,1fr)] grid-rows-[minmax(100px,1fr)] items-center gap-x-10 border-y border-[color:var(--page-border)] py-[18px] max-lg:min-h-[184px] max-lg:grid-cols-1 max-lg:grid-rows-[auto_minmax(100px,1fr)] max-lg:gap-y-4 max-lg:py-[18px_20px]'
      aria-labelledby='last-played-title'>
      <h2
        id='last-played-title'
        className='col-start-1 row-start-1 m-0 font-display text-[20px] font-normal leading-[1.35] text-[color:var(--page-text)] max-lg:col-start-1 max-lg:row-start-1'>
        Last played
      </h2>

      {isPending && !state ? (
        <StatusMessage className='col-start-2 row-start-1 max-lg:col-start-1 max-lg:row-start-2 max-lg:flex'>
          Checking Spotify…
        </StatusMessage>
      ) : null}

      {state && !state.configured ? (
        <StatusMessage className='col-start-2 row-start-1 max-lg:col-start-1 max-lg:row-start-2 max-lg:flex'>
          Spotify activity is unavailable.
        </StatusMessage>
      ) : null}

      {errorMessage ? (
        <StatusMessage className='col-start-2 row-start-1 max-lg:col-start-1 max-lg:row-start-2 max-lg:flex'>
          {errorMessage}
        </StatusMessage>
      ) : null}

      {state?.configured && !state.error && !track ? (
        <StatusMessage className='col-start-2 row-start-1 max-lg:col-start-1 max-lg:row-start-2 max-lg:flex'>
          No recently played track found.
        </StatusMessage>
      ) : null}

      {track ? (
        <a
          className='relative col-start-2 row-start-1 flex min-h-[100px] w-full min-w-0 items-start gap-3.5 rounded-[18px_18px_18px_6px] bg-[color-mix(in_srgb,var(--page-highlight)_9%,var(--page-background))] p-3 pr-[72px] text-[color:var(--page-text)] no-underline hover:bg-[color-mix(in_srgb,var(--page-highlight)_14%,var(--page-background))] max-lg:col-start-1 max-lg:row-start-2 max-lg:flex'
          href={track.url || undefined}
          target='_blank'
          rel='noreferrer'>
          {track.image ? (
            <Image
              src={track.image}
              alt=''
              className='block h-[76px] w-[76px] shrink-0 rounded-lg object-cover'
              width={76}
              height={76}
              sizes='76px'
              priority
              loading='eager'
            />
          ) : null}
          <span className='flex min-w-0 flex-col font-ui text-[13px] leading-[1.5]'>
            <strong className='overflow-hidden text-ellipsis whitespace-nowrap font-medium'>
              {track.title}
            </strong>
            <span className='overflow-hidden text-ellipsis whitespace-nowrap'>
              {track.artists.join(', ')}
            </span>
            <span className='overflow-hidden text-ellipsis whitespace-nowrap text-[color:var(--page-muted)]'>
              {track.album}
            </span>
            {track.playedAt ? (
              <time
                className='mt-2 text-[12px] text-[color:var(--page-muted)]'
                dateTime={track.playedAt}>
                {new Date(track.playedAt).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </time>
            ) : null}
          </span>
        </a>
      ) : null}
    </aside>
  )
}

export default LastPlayed
