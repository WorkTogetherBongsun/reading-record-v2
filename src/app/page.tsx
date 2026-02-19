'use client';

import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc,
  setDoc,
  serverTimestamp,
  where
} from 'firebase/firestore';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import Link from 'next/link';
import './globals.scss';

interface Note {
  id: string;
  title: string;
  createdAt: any;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isDebug, setIsDebug] = useState(false);
  const [debugDate, setDebugDate] = useState('');
  const todayId = new Date().toISOString().split('T')[0];

  // 1. 인증 상태 감시
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // 2. 사용자별 데이터 구독
  useEffect(() => {
    if (!user) {
      setNotes([]);
      return;
    }
    // 사용자의 uid가 일치하는 데이터만 가져옴
    const q = query(
      collection(db, 'notes'), 
      where('userId', '==', user.uid),
      orderBy('id', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Note[];
      setNotes(data);
    });
    return () => unsubscribe();
  }, [user]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => signOut(auth);

  const handleStartRecord = async (targetId: string) => {
    if (!user) return;
    const finalId = targetId || todayId;
    const [y, m, d] = finalId.split('-');
    
    // 문서 ID에 유저 UID를 조합하여 고유성 확보 (또는 문서 내 userId 필드로 구분)
    // 여기서는 문서 내 userId 필드를 사용하는 방식을 유지하고 ID는 날짜로 유지
    const todayDoc = doc(db, 'notes', `${user.uid}_${finalId}`);
    await setDoc(todayDoc, {
      title: `${m}월 ${d}일의 밤`,
      createdAt: serverTimestamp(),
      id: finalId,
      userId: user.uid // 유저 ID 저장
    }, { merge: true });
    
    window.location.href = `/record/${finalId}`;
  };

  const hasTodayRecord = notes.some(n => n.id === todayId);

  if (!user) {
    return (
      <main className="container" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh'}}>
        <h1 style={{fontSize: '4rem', marginBottom: '20px'}}>🌙</h1>
        <h2 style={{color: 'white', marginBottom: '40px'}}>Night Reading</h2>
        <button onClick={handleLogin} className="submit-btn" style={{width: 'auto', padding: '16px 32px'}}>
          Google 계정으로 시작하기
        </button>
      </main>
    );
  }

  return (
    <main className="container">
      <header className="header" onDoubleClick={() => setIsDebug(!isDebug)}>
        <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '20px'}}>
            <button onClick={handleLogout} style={{background: 'none', border: '1px solid #333', color: '#666', padding: '4px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem'}}>로그아웃</button>
        </div>
        <h1 style={{fontSize: '3rem'}}>🌙</h1>
        <h2 style={{fontSize: '2rem', color: 'white', marginBottom: '8px'}}>Night Reading</h2>
        <p>{user.displayName}님의 밤이 기록으로 남는 공간</p>
      </header>

      <div className="dashboard-summary" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        marginBottom: '40px'
      }}>
        <div className="stat-card" style={{ background: '#1e1e1e', padding: '20px', borderRadius: '20px', border: '1px solid #333', textAlign: 'center' }}>
          <span style={{color: '#a0a0a0', fontSize: '0.8rem'}}>총 기록 일수</span>
          <p style={{fontSize: '1.8rem', fontWeight: 'bold', margin: '8px 0', color: '#6366f1'}}>{notes.length}일</p>
        </div>
        <div className="stat-card" style={{ background: '#1e1e1e', padding: '20px', borderRadius: '20px', border: '1px solid #333', textAlign: 'center' }}>
          <span style={{color: '#a0a0a0', fontSize: '0.8rem'}}>이번 달 기록</span>
          <p style={{fontSize: '1.8rem', fontWeight: 'bold', margin: '8px 0', color: '#fbbf24'}}>
            {notes.filter(n => n.id.startsWith(todayId.slice(0, 7))).length}회
          </p>
        </div>
      </div>

      <div className="note-list-view">
        {isDebug && (
          <div className="form-card" style={{borderColor: '#ef4444', marginBottom: '24px'}}>
            <h4 style={{color: '#ef4444', marginTop: 0}}>🛠 Debug Mode</h4>
            <div style={{display: 'flex', gap: '10px'}}>
              <input type="date" value={debugDate} onChange={(e) => setDebugDate(e.target.value)} style={{flex: 2, marginBottom: 0}} />
              <button className="submit-btn" style={{flex: 1, backgroundColor: '#ef4444'}} onClick={() => handleStartRecord(debugDate)}>생성</button>
            </div>
          </div>
        )}

        <button 
          className="submit-btn" 
          style={{ marginBottom: '48px', fontSize: '1.2rem', padding: '20px', boxShadow: hasTodayRecord ? 'none' : '0 0 20px rgba(99, 102, 241, 0.4)' }}
          onClick={() => handleStartRecord(todayId)}
        >
          {hasTodayRecord ? '🌙 오늘의 기록 이어가기' : '✨ 오늘의 기록 시작하기'}
        </button>

        <h3 style={{color: '#a0a0a0', marginBottom: '20px', fontSize: '1rem', borderBottom: '1px solid #333', paddingBottom: '10px'}}>나의 기록들</h3>
        <div className="record-list">
          {notes.map((note) => (
            <Link href={`/record/${note.id}`} key={note.id} style={{textDecoration: 'none'}}>
              <div className="record-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px' }}>
                <div>
                  <span style={{fontSize: '0.8rem', color: '#6366f1', display: 'block', marginBottom: '4px'}}>{formatDate(note.id)}</span>
                  <p className="content" style={{fontSize: '1.2rem', margin: 0, color: 'white'}}>{note.title}</p>
                </div>
                <span style={{color: '#333'}}>→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    return `${m}월 ${d}일`;
};
