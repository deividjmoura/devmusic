import { useRef, useState, useEffect } from "react"
import { useMusic } from "@/context/MusicContext"

export default function Player() {

  const { currentTrack, nextTrack, previousTrack } = useMusic()

  const audioRef = useRef(null)

  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {

    if (!currentTrack) return

    const audio = audioRef.current

    audio.src = currentTrack.url
    audio.play().then(() => setPlaying(true))

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

    if (!time) return "0:00"

    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)

    return `${minutes}:${seconds.toString().padStart(2,"0")}`
  }

  if (!currentTrack) return null

  return (

    <div className="fixed bottom-0 left-0 w-full bg-gray-900 text-white p-4">

      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoaded}
        onEnded={nextTrack}
      />

      <div className="flex items-center justify-between">

        <div>
          <div className="font-bold">
            {currentTrack.title}
          </div>

          <div className="text-sm text-gray-400">
            {currentTrack.artist}
          </div>
        </div>

        <div className="flex items-center gap-4">

          <button onClick={previousTrack}>
            ⏮
          </button>

          <button
            onClick={togglePlay}
            className="bg-green-500 px-4 py-2 rounded"
          >
            {playing ? "Pause" : "Play"}
          </button>

          <button onClick={nextTrack}>
            ⏭
          </button>

        </div>

        <div className="flex items-center gap-2 w-1/3">

          <span className="text-sm">
            {formatTime(currentTime)}
          </span>

          <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={handleSeek}
            className="w-full"
          />

          <span className="text-sm">
            {formatTime(duration)}
          </span>

        </div>

      </div>

    </div>

  )
}