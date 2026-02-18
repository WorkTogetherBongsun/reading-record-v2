'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import './globals.scss';

interface Sentence {
  id: string;
  content: string;
  bookTitle: string;
  type: 'insight' | 'quote';
  createdAt: any;
}

export default function Home() {
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [content, setContent] = useState('');
  const [bookTitle, setBookTitle] = useState('');
  const [type, setType] = useState<'insight' | 'quote'>('insight');

  useEffect(() => {
    // 실시간 데이터 구독
    const q = query(collection(db, 'sentences'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Sentence[];
      setSentences(data);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) return;
    
    try {
      await addDoc(collection(db, 'sentences'), {
        content,
        bookTitle,
        type,
        createdAt: serverTimestamp()
      });
      setContent('');
      setBookTitle('');
    } catch (err) {
      console.error('Firebase Error:', err);
      alert('저장에 실패했습니다. Firebase 설정을 확인해주세요.');
    }
  };

  const formatDate = (createdAt: any) => {
    if (!createdAt) return '';
    const date = createdAt instanceof Timestamp ? createdAt.toDate() : new Date(createdAt);
    return date.toLocaleDateString();
  };

  return (
    <main className="container">
      <header className="header">
        <h1>🌙 Night Reading</h1>
        <p>오늘 밤, 당신의 마음을 스친 문장과 깨달음</p>
      </header>
      
      <form onSubmit={handleSubmit} className="form-card">
        <div className="type-selector">
          <button
            type="button"
            onClick={() => setType('insight')}
            className={type === 'insight' ? 'active' : ''}
          >
            💡 깨달음
          </button>
          <button
            type="button"
            onClick={() => setType('quote')}
            className={type === 'quote' ? 'active' : ''}
          >
            📖 문장
          </button>
        </div>

        <textarea
          placeholder={type === 'insight' ? "오늘 새롭게 깨달은 내용은 무엇인가요?" : "마음에 남은 문장을 적어주세요..."}
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <input
          type="text"
          placeholder="어떤 책인가요? (선택)"
          value={bookTitle}
          onChange={(e) => setBookTitle(e.target.value)}
        />
        <button type="submit" className="submit-btn">
          기록 남기기
        </button>
      </form>

      <div className="record-list">
        {sentences.map((s) => (
          <div key={s.id} className="record-item">
            <span className={`badge ${s.type}`}>
              {s.type === 'insight' ? '💡 INSIGHT' : '📖 QUOTE'}
            </span>
            <p className="content">{s.content}</p>
            <div className="footer">
              <span className="book-title">{s.bookTitle ? `— ${s.bookTitle}` : ''}</span>
              <span>{formatDate(s.createdAt)}</span>
            </div>
          </div>
        ))}
        {sentences.length === 0 && (
          <p style={{ textAlign: 'center', color: '#666', marginTop: '20px' }}>
            기다리고 있어요. 첫 기록을 남겨보세요.
          </p>
        )}
      </div>
    </main>
  );
}
