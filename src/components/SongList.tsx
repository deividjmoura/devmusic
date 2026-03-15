import React, { useEffect } from 'react';
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Song } from '../types';
import { User } from 'firebase/auth';

interface SongListProps {
  user: User | null;
  onPlay: (url: string, song: Song) => void;
  songs: Song[];
  setSongs: React.Dispatch<React.SetStateAction<Song[]>>;
}

export const SongList: React.FC<SongListProps> = ({ user, onPlay, songs, setSongs }) => {
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'songs'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const songList: Song[] = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: (data.createdAt as any).toDate(),
        } as Song;
      });
      setSongs(songList);
    });
    return unsubscribe;
  }, [user, setSongs]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this song?')) return;
    try {
      await deleteDoc(doc(db, 'songs', id));
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Delete failed!');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Songs</h2>
      {songs.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No songs yet. Upload some!</p>
      ) : (
        <div className="grid gap-4">
          {songs.map((song) => (
            <div key={song.id} className="flex items-center justify-between p-4 bg-white/80 backdrop-blur rounded-xl shadow-md hover:shadow-lg transition-all">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg text-gray-900 truncate">{song.title}</h3>
                <p className="text-gray-600">{song.artist} • by {song.userName}</p>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => onPlay(song.url, song)}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                >
                  Play
                </button>
                {user && song.uid === user.uid && (
                  <button
                    onClick={() => handleDelete(song.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};