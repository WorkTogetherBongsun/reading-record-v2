'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc,
  setDoc,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import Link from 'next/link';
import './globals.scss';

interface Note {
  id: string; // YYYY-MM-DD 형식
  title: string;
  createdAt: any;
}

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isDebug, setIsDebug] = useState(false);
  const [debugDate, setDebugDate] = useState('');
  const todayId = new Date().toISOString().split('T')[0]; // 오늘 날짜 ID

  // 일 단위 기록 목록 구독
  useEffect(() => {
    const q = query(collection(db, 'notes'), orderBy('id', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Note[];
      setNotes(data);
    });
    return () => unsubscribe();
  }, []);

  // 기록 시작하기 (지정된 ID 또는 오늘 ID)
  const handleStartRecord = async (targetId: string) => {
    const finalId = targetId || todayId;
    const [y, m, d] = finalId.split('-');
    
    const todayDoc = doc(db, 'notes', finalId);
    await setDoc(todayDoc, {
      title: `${m}월 ${d}일의 기록`,
      createdAt: serverTimestamp(),
      id: finalId
    }, { merge: true });
    
    window.location.href = `/record/${finalId}`;
  };

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    return `${m}월 ${d}일`;
  };

  return (
    <main className="container">
      <header className="header" onDoubleClick={() => setIsDebug(!isDebug)}>
        <h1>🌙 Night Reading</h1>
        <p>매일 밤, 당신의 마음을 스친 문장들</p>
      </header>

      <div className="note-list-view">
        {isDebug && (
          <div className="form-card" style={{borderColor: '#ef4444', marginBottom: '24px'}}>
            <h4 style={{color: '#ef4444', marginTop: 0}}>🛠 Debug Mode</h4>
            <div style={{display: 'flex', gap: '10px'}}>
              <input 
                type="date" 
                value={debugDate} 
                onChange={(e) => setDebugDate(e.target.value)}
                style={{flex: 2, marginBottom: 0}}
              />
              <button 
                className="submit-btn" 
                style={{flex: 1, backgroundColor: '#ef4444'}}
                onClick={() => handleStartRecord(debugDate)}
              >
                기록 생성
              </button>
            </div>
          </div>
        )}

        <button 
          className="submit-btn" 
          style={{marginBottom: '40px', fontSize: '1.1rem'}}
          onClick={() => handleStartRecord(todayId)}
        >
          ✨ {notes.find(n => n.id === todayId) ? '오늘의 기록 이어가기' : '오늘의 기록 시작하기'}
        </button>

        <h3 style={{color: '#a0a0a0', marginBottom: '20px', fontSize: '0.9rem'}}>지나온 밤들</h3>
        <div className="record-list">
          {notes.map((note) => (
            <Link href={`/record/${note.id}`} key={note.id} style={{textDecoration: 'none'}}>
              <div className="record-item">
                <div className="footer">
                  <span style={{fontSize: '0.8rem', color: '#6366f1'}}>{formatDate(note.id)}</span>
                </div>
                <p className="content" style={{fontSize: '1.4rem', margin: '8px 0'}}>{note.title}</p>
              </div>
            </Link>
          ))}
          {notes.length === 0 && (
            <p style={{textAlign: 'center', color: '#666', marginTop: '40px'}}>
              아직 기록이 없습니다. 오늘부터 시작해보세요.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
