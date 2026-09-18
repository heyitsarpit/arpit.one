export type StoredPlaylistTrack = {
  id: string
  name: string
  artists: string[]
  album: string
  albumImage: string
  url: string
}

export type StoredPlaylist = {
  id: string
  name: string
  description: string
  image: string
  url: string
  tracks: StoredPlaylistTrack[]
}

export type StoredPlaylistLibrary = {
  generatedAt: string | null
  owner: {
    id: string
    displayName: string
  }
  playlists: StoredPlaylist[]
}
