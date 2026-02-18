'use client';

import { useState, useEffect, use } from 'react';
import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import Link from 'next/link';
import '@/app/globals.scss';

interface Record {
  id: string;
  content: string;
  bookTitle?: string;
  type: 'insight' | 'quote';
  createdAt: any;
}

export default function RecordDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id: dateId } = use(params);
  const [records, setRecords] = useState<Record[]>([]);
  const [content, setContent] = useState('');
  const [bookTitle, setBookTitle] = useState('');
  const [type, setType] = useState<'insight' | 'quote'>('insight');

  useEffect(() => {
    const q = query(
      collection(db, `notes/${dateId}/records`), 
      orderBy('createdAt', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Record[];
      setRecords(data);
    });
    return () => unsubscribe();
  }, [dateId]);

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) return;
    try {
      await addDoc(collection(db, `notes/${dateId}/records`), {
        content,
        bookTitle,
        type,
        createdAt: new Date().toISOString() // serverTimestamp 대신 빠른 피드백을 위해 ISO 사용 가능
      });
      setContent('');
      setBookTitle('');
    } catch (err) {
      console.error(err);
    }
  };

  const [m, d] = dateId.split('-').slice(1);

  return (
    <main className="container">
      <header className="header">
        <Link href="/" style={{textDecoration: 'none'}}>
            <h1 style={{fontSize: '1.5rem', opacity: 0.7}}>🌙 Night Reading</h1>
        </Link>
        <h2 style={{fontSize: '2.2rem', color: 'white', marginTop: '10px'}}>{m}월 {d}일의 밤</h2>
      </header>

      <div className="note-detail-view">
        <Link href="/" className="back-btn" style={{display: 'inline-block', marginBottom: '24px', color: '#a0a0a0', textDecoration: 'none'}}>
          ← 목록으로 돌아가기
        </Link>
        
        <form onSubmit={handleAddRecord} className="form-card">
          <div className="type-selector">
            <button type="button" onClick={() => setType('insight')} className={type === 'insight' ? 'active' : ''}>💡 깨달음</button>
            <button type="button" onClick={() => setType('quote')} className={type === 'quote' ? 'active' : ''}>📖 문장</button>
          </div>
          <textarea
            className="w-full bg-[#252525] p-4 rounded-xl mb-4 text-white"
            placeholder={type === 'insight' ? "무엇을 깨달았나요?" : "어떤 문장이 남았나요?"}
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <input
            type="text"
            className="w-full bg-[#252525] p-4 rounded-xl mb-4 text-white"
            placeholder="책 제목 (선택)"
            value={bookTitle}
            onChange={(e) => setBookTitle(e.target.value)}
          />
          <button type="submit" className="submit-btn">문장 추가하기</button>
        </form>

        <div className="record-list">
          {records.map((r) => (
            <div key={r.id} className="record-item">
              <span className={`badge ${r.type}`}>{r.type === 'insight' ? 'INSIGHT' : 'QUOTE'}</span>
              <p className="content">{r.content}</p>
              {r.bookTitle && <div className="footer"><span className="book-title">— {r.bookTitle}</span></div>}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
