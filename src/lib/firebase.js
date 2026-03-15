import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAqKbeTnsS7NwJZRnyiZtKTM2zFt6gk42M",
  authDomain: "devmusic-6bf48.firebaseapp.com",
  databaseURL: "https://devmusic-6bf48-default-rtdb.firebaseio.com",
  projectId: "devmusic-6bf48",
  storageBucket: "devmusic-6bf48.firebasestorage.app",
  messagingSenderId: "404399016734",
  appId: "1:404399016734:web:c954fa8a10fbacf508d70f",
  measurementId: "G-YNXDMH8PQW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);