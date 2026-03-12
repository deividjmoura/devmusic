import { createContext, useContext, useState } from 'react'
import { musicLibrary } from '@/data/musicLibrary'

const MusicContext = createContext()

export function MusicProvider({ children }) {
  const [playlist] = useState(musicLibrary)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(null)

  const currentTrack =
    currentTrackIndex !== null ? playlist[currentTrackIndex] : null

  const playTrack = (track) => {
    const index = playlist.findIndex((t) => t.id === track.id)
    setCurrentTrackIndex(index)
  }

  const nextTrack = () => {
    if (currentTrackIndex === null) return

    const next = (currentTrackIndex + 1) % playlist.length
    setCurrentTrackIndex(next)
  }

  const previousTrack = () => {
    if (currentTrackIndex === null) return

    const prev = (currentTrackIndex - 1 + playlist.length) % playlist.length
    setCurrentTrackIndex(prev)
  }

  return (
    <MusicContext.Provider
      value={{
        playlist,
        currentTrack,
        playTrack,
        nextTrack,
        previousTrack,
      }}
    >
      {children}
    </MusicContext.Provider>
  )
}

export function useMusic() {
  return useContext(MusicContext)
}
