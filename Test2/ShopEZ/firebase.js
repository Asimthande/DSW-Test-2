import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
const firebaseConfig = {
  apiKey: "AIzaSyDXLE7Dxj9bAutgaDBTbdeb35RRFAHA8eQ",
  authDomain: "test2-d6af2.firebaseapp.com",
  databaseURL: "https://test2-d6af2-default-rtdb.firebaseio.com",
  projectId: "test2-d6af2",
  storageBucket: "test2-d6af2.firebasestorage.app",
  messagingSenderId: "946744939867",
  appId: "1:946744939867:web:e1ad6af34b8bf35ab5b67e",
  measurementId: "G-R02C8ZSPEZ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);