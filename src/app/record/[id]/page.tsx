'use client';

import { useState, useEffect, use } from 'react';
import { db, auth } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot,
  where
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import Link from 'next/link';
import '@/app/globals.scss';

interface Record {
  id: string;
  content: string;
  bookTitle?: string;
  type: 'insight' | 'quote';
  category: string;
  tags: string[];
  createdAt: any;
  userId: string;
}

export default function RecordDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id: dateId } = use(params);
  
  // --- 구글 로그인 임시 주석 처리 ---
  // const [user, setUser] = useState<User | null>(null);
  const [user, setUser] = useState<any>({ uid: 'default_user', displayName: '기록자' }); 

  /*
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);
  */
  // -----------------------------

  const [records, setRecords] = useState<Record[]>([]);
  const [content, setContent] = useState('');
  const [bookTitle, setBookTitle] = useState('');
  const [type, setType] = useState<'insight' | 'quote'>('insight');
  const [category, setCategory] = useState('생각');
  const [tags, setTags] = useState('');

  const categories = ['생각', '철학', '성장', '기술', '문장', '기타'];

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, `notes/${user.uid}_${dateId}/records`), 
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
  }, [user, dateId]);

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content || !user) return;
    try {
      await addDoc(collection(db, `notes/${user.uid}_${dateId}/records`), {
        content,
        bookTitle,
        type,
        category,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
        createdAt: new Date().toISOString(),
        userId: user.uid
      });
      setContent('');
      setBookTitle('');
      setTags('');
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

          <div className="category-selector" style={{display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px'}}>
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: '1px solid #333',
                  background: category === cat ? '#6366f1' : '#1e1e1e',
                  color: category === cat ? 'white' : '#a0a0a0',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {cat}
              </button>
            ))}
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
          <input
            type="text"
            className="w-full bg-[#252525] p-4 rounded-xl mb-4 text-white"
            placeholder="태그 (쉼표로 구분, 예: 행복, 아침)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          <button type="submit" className="submit-btn">문장 추가하기</button>
        </form>

        <div className="record-list">
          {records.map((r) => (
            <div key={r.id} className="record-item">
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
                <span className={`badge ${r.type}`}>{r.type === 'insight' ? 'INSIGHT' : 'QUOTE'}</span>
                <span style={{fontSize: '0.75rem', color: '#6366f1', fontWeight: 'bold'}}>#{r.category}</span>
              </div>
              <p className="content">{r.content}</p>
              <div className="footer" style={{display: 'block'}}>
                {r.bookTitle && <span className="book-title" style={{display: 'block', marginBottom: '8px'}}>— {r.bookTitle}</span>}
                <div className="tags" style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                  {r.tags?.map((tag: string) => (
                    <span key={tag} style={{fontSize: '0.75rem', color: '#666', background: '#252525', padding: '2px 8px', borderRadius: '4px'}}>
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
