import { createContext, useContext, useState } from 'react'

const MusicContext = createContext()

export function MusicProvider({ children }) {
  const [currentTrack, setCurrentTrack] = useState(null)

  const playTrack = (track) => {
    setCurrentTrack(track)
  }

  return (
    <MusicContext.Provider value={{ currentTrack, playTrack }}>
      {children}
    </MusicContext.Provider>
  )
}

export function useMusic() {
  return useContext(MusicContext)
}
