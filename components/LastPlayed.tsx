import { useEffect, useState } from 'react'

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

const LastPlayed: React.FC = () => {
  const [state, setState] = useState<ApiState | null>(null)

  useEffect(() => {
    let cancelled = false

    fetch('/api/spotify/recently-played')
      .then(async (response) => {
        const payload = (await response.json()) as ApiState
        if (!response.ok && !payload.error && payload.configured !== false) {
          throw new Error('Spotify history could not be loaded.')
        }
        return payload
      })
      .then((payload) => {
        if (!cancelled) setState(payload)
      })
      .catch((error: Error) => {
        if (!cancelled) {
          setState({ configured: true, track: null, error: error.message })
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const track = state?.track

  return (
    <aside
      className='site-last-played-layer'
      aria-labelledby='last-played-title'>
      <h2 id='last-played-title'>Last played</h2>

      {!state ? <p className='site-spotify-status'>Checking Spotify…</p> : null}

      {state && !state.configured ? (
        <p className='site-spotify-status'>Spotify activity is unavailable.</p>
      ) : null}

      {state?.error ? (
        <p className='site-spotify-status'>{state.error}</p>
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
