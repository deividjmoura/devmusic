import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Song } from '../types';

interface SongPlayerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
}

export const SongPlayer: React.FC<SongPlayerProps> = ({
  currentSong,
  isPlaying,
  onTogglePlay,
  onSeek,
  volume,
  onVolumeChange,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    const setAudioData = () => {
      setDuration(audio.duration);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', setAudioData);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', setAudioData);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play();
    } else {
      audio.pause();
    }
  }, [isPlaying, currentSong]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
    }
  }, [volume]);

  const handlePlayPause = () => {
    onTogglePlay();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    onSeek(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!currentSong) {
    return (
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-4 rounded-xl shadow-2xl">
        <p className="text-center text-gray-400">No song playing</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-4 rounded-xl shadow-2xl flex items-center space-x-4">
      <img
        src={`https://picsum.photos/seed/${currentSong.id}/64/64`} // Placeholder album art
        alt={currentSong.title}
        className="w-16 h-16 rounded-lg shadow-lg"
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold truncate">{currentSong.title}</h3>
        <p className="text-indigo-100 truncate">{currentSong.artist}</p>
      </div>
      <div className="flex items-center space-x-2 w-48">
        <button
          onClick={handlePlayPause}
          className="p-2 rounded-full bg-white/20 hover:bg-white/40 transition-all"
        >
          {isPlaying ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>
      <div className="flex-1 mx-4">
        <div className="flex items-center space-x-2 text-xs">
          <span>{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleSeek}
            className="flex-1 h-2 bg-white/30 rounded-lg appearance-none cursor-pointer accent-white hover:bg-white/50"
          />
          <span>{formatTime(duration)}</span>
        </div>
      </div>
      <div className="flex items-center space-x-1">
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className="w-16 h-2 bg-white/30 rounded-lg appearance-none cursor-pointer accent-white hover:bg-white/50"
        />
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.883 12.878a.5.5 0 01-.708-.707L11.293 10H7.5a.5.5 0 010-1h3.793l-2.118-2.121a.5.5 0 11.708-.707l3 3a.5.5 0 010 .707l-3 3z" />
        </svg>
      </div>
      <audio ref={audioRef} src={currentSong.url} preload="metadata" />
    </div>
  );
};