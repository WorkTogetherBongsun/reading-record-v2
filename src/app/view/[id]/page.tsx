'use client';

import { useState, useEffect, use } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue, update } from 'firebase/database';
import { Book } from '@/types/note';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function FocusViewer({ params }: { params: Promise<{ id: string }> }) {
  const { id: bookId } = use(params);
  const searchParams = useSearchParams();
  const uid = searchParams.get('uid') || 'default_user';
  
  const [book, setBook] = useState<Book | null>(null);
  const [highlights, setHighlights] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const bookRef = ref(db, `books/${uid}/${bookId}`);
    onValue(bookRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setBook(data);
        setHighlights(data.highlights || {});
      }
    });
  }, [bookId, uid]);

  // 하이라이트 토글 (길게 누르기 시뮬레이션: 클릭으로 우선 구현)
  const toggleHighlight = async (index: number) => {
    const newHighlights = { ...highlights, [index]: !highlights[index] };
    setHighlights(newHighlights);
    
    // DB 업데이트
    const bookRef = ref(db, `books/${uid}/${bookId}`);
    await update(bookRef, { highlights: newHighlights });
  };

  if (!book) return <div style={{textAlign: 'center', paddingTop: '100px', color: '#666'}}>책을 불러오는 중...</div>;

  return (
    <main style={{ backgroundColor: '#fff', color: '#111', minHeight: '100vh', padding: '100px 24px' }}>
      {/* Distraction-free Header */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
        <Link href="/books" style={{color: '#888', textDecoration: 'none', fontSize: '0.9rem'}}>← 서재로 돌아가기</Link>
        <div style={{fontSize: '0.8rem', color: '#aaa'}}>Focus Mode Activated</div>
      </div>

      <article style={{ maxWidth: '600px', margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h1 style={{ fontSize: '3rem', fontFamily: 'serif', marginBottom: '20px' }}>{book.title}</h1>
          <p style={{ color: '#666', fontStyle: 'italic' }}>Written by {book.author}</p>
        </header>

        <section style={{ fontSize: '1.25rem', lineHeight: '2', fontFamily: 'serif', textAlign: 'justify' }}>
          {book.content.map((sentence, idx) => (
            <span 
              key={idx}
              onClick={() => toggleHighlight(idx)}
              style={{
                backgroundColor: highlights[idx] ? '#fef08a' : 'transparent',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
                marginRight: '8px'
              }}
            >
              {sentence}
            </span>
          ))}
        </section>
      </article>

      <footer style={{ marginTop: '150px', textAlign: 'center', color: '#999', fontSize: '0.8rem' }}>
        © 2026 Night Reading Book Maker. All rights reserved.
      </footer>
    </main>
  );
}
