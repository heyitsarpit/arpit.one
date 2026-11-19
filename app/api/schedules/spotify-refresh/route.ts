import { handleSchedule } from '@vercel/schedules'

// Private scheduled function (no public URL). Vercel Schedules invokes it daily
// (see vercel.json). It asks Vercel to build again through a Deploy Hook, and the
// build runs the Spotify sync (scripts/prebuildSpotify.mjs).
export const POST = handleSchedule(async () => {
  const hook = process.env.VERCEL_DEPLOY_HOOK_URL
  if (!hook) throw new Error('VERCEL_DEPLOY_HOOK_URL is not set.')

  const response = await fetch(hook, { method: 'POST' })
  if (!response.ok) {
    throw new Error(`Deploy hook failed (${response.status}).`)
  }
})
