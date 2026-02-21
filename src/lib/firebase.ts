import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCJa7zzyj_-aAmPOPZ2AIW6M20TanpiZG4",
  authDomain: "book-maker-ed6b4.firebaseapp.com",
  projectId: "book-maker-ed6b4",
  storageBucket: "book-maker-ed6b4.firebasestorage.app",
  messagingSenderId: "257342307693",
  appId: "1:257342307693:web:bee3ae89a3274e66252e64",
  measurementId: "G-G5WY41RZ1Q",
  databaseURL: "https://book-maker-ed6b4-default-rtdb.firebaseio.com/" // Realtime Database URL 추가
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getDatabase(app); // Firestore 대신 Realtime Database 인스턴스 사용
const auth = getAuth(app);

export { db, auth };
