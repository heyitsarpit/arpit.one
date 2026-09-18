import { useQuery } from '@tanstack/react-query'

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
    staleTime: 60 * 1000
  })

  const track = state?.track
  const errorMessage = state?.error || error?.message

  return (
    <aside
      className='site-last-played-layer'
      aria-labelledby='last-played-title'>
      <h2 id='last-played-title'>Last played</h2>

      {isPending && !state ? (
        <p className='site-spotify-status'>Checking Spotify…</p>
      ) : null}

      {state && !state.configured ? (
        <p className='site-spotify-status'>Spotify activity is unavailable.</p>
      ) : null}

      {errorMessage ? (
        <p className='site-spotify-status'>{errorMessage}</p>
      ) : null}

      {state?.configured && !state.error && !track ? (
        <p className='site-spotify-status'>No recently played track found.</p>
      ) : null}

      {track ? (
        <a
          className='site-last-played-track'
          href={track.url || undefined}
          target='_blank'
          rel='noreferrer'>
          {track.image ? (
            <img src={track.image} alt='' className='site-last-played-art' />
          ) : null}
          <span className='site-last-played-copy'>
            <strong>{track.title}</strong>
            <span>{track.artists.join(', ')}</span>
            <span className='site-last-played-album'>{track.album}</span>
            {track.playedAt ? (
              <time dateTime={track.playedAt}>
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
