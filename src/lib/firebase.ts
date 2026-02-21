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
  databaseURL: "https://book-maker-ed6b4-default-rtdb.asia-southeast1.firebasedatabase.app/" // 정확한 아시아 서버 URL 적용
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

export { db, auth };
