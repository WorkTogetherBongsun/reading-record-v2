import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage"; // Storage 추가

const firebaseConfig = {
  apiKey: "AIzaSyCJa7zzyj_-aAmPOPZ2AIW6M20TanpiZG4",
  authDomain: "book-maker-ed6b4.firebaseapp.com",
  projectId: "book-maker-ed6b4",
  storageBucket: "book-maker-ed6b4.firebasestorage.app",
  messagingSenderId: "257342307693",
  appId: "1:257342307693:web:bee3ae89a3274e66252e64",
  measurementId: "G-G5WY41RZ1Q",
  databaseURL: "https://book-maker-ed6b4-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const storage = getStorage(app); // Storage 인스턴스 생성

export { db, auth, storage };
