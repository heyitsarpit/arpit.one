import { useQuery } from '@tanstack/react-query'

import type { StoredPlaylistLibrary } from '@/utils/playlists'

const fetchPlaylistLibrary = async (): Promise<StoredPlaylistLibrary> => {
  const response = await fetch('/api/playlist-library')
  const payload = (await response.json()) as StoredPlaylistLibrary & {
    error?: string
  }

  if (!response.ok) {
    throw new Error(payload.error || 'Playlist library is unavailable.')
  }

  return payload
}

export const usePlaylistLibrary = () =>
  useQuery({
    queryKey: ['playlist-library', 'v1'],
    queryFn: fetchPlaylistLibrary
  })
