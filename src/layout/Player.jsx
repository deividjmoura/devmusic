import { useRef, useState, useEffect } from 'react'
import { useMusic } from '@/context/MusicContext'

export default function Player() {
  const audioRef = useRef(null)

  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const { currentTrack } = useMusic()

  useEffect(() => {
    if (!currentTrack) return

    const audio = audioRef.current

    audio.src = currentTrack.url

    audio
      .play()
      .then(() => {
        setPlaying(true)
      })
      .catch(() => {
        setPlaying(false)
      })
  }, [currentTrack])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    if (playing) {
      audio.pause()
    } else {
      audio.play()
    }

    setPlaying(!playing)
  }

  const handleTimeUpdate = () => {
    const audio = audioRef.current
    setCurrentTime(audio.currentTime)
  }

  const handleLoaded = () => {
    const audio = audioRef.current
    setDuration(audio.duration)
  }

  const handleSeek = (e) => {
    const audio = audioRef.current
    audio.currentTime = e.target.value
    setCurrentTime(e.target.value)
  }

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div style={{ borderTop: '1px solid #ccc', padding: '10px' }}>
      <audio
        ref={audioRef}
        src={currentTrack?.url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoaded}
      />

      <div style={{ marginBottom: '10px' }}>
        {currentTrack && (
          <div style={{ marginBottom: '10px' }}>
            <strong>{currentTrack.title}</strong> - {currentTrack.artist}
          </div>
        )}
      </div>

      <button onClick={togglePlay}>{playing ? 'Pause' : 'Play'}</button>

      <div style={{ marginTop: '10px' }}>
        <span>{formatTime(currentTime)}</span>

        <input
          type="range"
          min="0"
          max={duration}
          value={currentTime}
          onChange={handleSeek}
          style={{ width: '300px', margin: '0 10px' }}
        />

        <span>{formatTime(duration)}</span>
      </div>
    </div>
  )
}
