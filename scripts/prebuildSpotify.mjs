import { execFileSync } from 'node:child_process'
import path from 'node:path'

// Runs before every `next build`. On Vercel the Spotify variables come from the
// project environment; locally they are usually only in .env.local, which the
// sync script is not given here, so a local build without them skips the sync
// and keeps the committed data/spotify-playlists.json.
const requiredEnvironment = [
  'SPOTIFY_CLIENT_ID',
  'SPOTIFY_CLIENT_SECRET',
  'SPOTIFY_REFRESH_TOKEN'
]

const missing = requiredEnvironment.filter((name) => !process.env[name])
if (missing.length > 0) {
  console.log(
    `Skipping Spotify sync, missing: ${missing.join(', ')}. Using committed data.`
  )
  process.exit(0)
}

execFileSync(
  process.execPath,
  [path.resolve(process.cwd(), 'scripts/syncSpotifyPlaylists.mjs')],
  { stdio: 'inherit', env: process.env }
)
