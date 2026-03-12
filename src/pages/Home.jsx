import { musicLibrary } from '@/data/musicLibrary'
import { useMusic } from '@/context/MusicContext'

export default function Home() {
  const { playTrack } = useMusic()

  return (
    <div>
      <h1>Music Library</h1>

      {musicLibrary.map((music) => (
        <div
          key={music.id}
          onClick={() => playTrack(music)}
          style={{ cursor: 'pointer' }}
        >
          <strong>{music.title}</strong> - {music.artist}
        </div>
      ))}
    </div>
  )
}
