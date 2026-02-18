import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCJa7zzyj_-aAmPOPZ2AIW6M20TanpiZG4",
  authDomain: "book-maker-ed6b4.firebaseapp.com",
  projectId: "book-maker-ed6b4",
  storageBucket: "book-maker-ed6b4.firebasestorage.app",
  messagingSenderId: "257342307693",
  appId: "1:257342307693:web:bee3ae89a3274e66252e64",
  measurementId: "G-G5WY41RZ1Q"
};

// 앱이 이미 초기화되었는지 확인
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
