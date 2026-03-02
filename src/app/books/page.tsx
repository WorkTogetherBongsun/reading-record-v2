'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { Book } from '@/types/note';
import Link from 'next/link';
import GlobalHeader from '@/components/common/GlobalHeader';

export default function BookShelfPage() {
  const [user] = useState({ uid: 'default_user', displayName: '기록자' });
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    const booksRef = ref(db, `books/${user.uid}`);
    onValue(booksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const booksList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setBooks(booksList.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      } else {
        setBooks([]);
      }
    });
  }, []);

  return (
    <main className="container-layout" style={{ paddingTop: '80px' }}>
      <GlobalHeader />

      <header className="header-section" style={{ textAlign: 'left', marginTop: '40px', marginBottom: '60px' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '12px', fontWeight: 'bold' }}>나의 서재</h2>
        <p style={{ color: '#888' }}>지금까지 발간된 당신의 사유들입니다.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '32px' }}>
        {books.map(book => (
          <Link href={`/view/${book.id}?uid=${user.uid}`} key={book.id} style={{ textDecoration: 'none' }}>
            <div className="card-base" style={{ height: '100%', position: 'relative', overflow: 'hidden', padding: '32px' }}>
              <div style={{ fontSize: '0.8rem', color: '#6366f1', marginBottom: '16px', fontWeight: '600' }}>{new Date(book.createdAt).toLocaleDateString()}</div>
              <h3 style={{ fontSize: '1.6rem', marginBottom: '12px', color: 'white', lineHeight: '1.4' }}>{book.title}</h3>
              <p style={{ color: '#555', fontSize: '0.9rem' }}>총 {book.content.length}개의 문장</p>
              
              <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
                <span style={{ color: '#333', fontSize: '1.2rem' }}>→</span>
              </div>
            </div>
          </Link>
        ))}
        {books.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px 0', border: '1px dashed #222', borderRadius: '20px' }}>
            <p style={{ color: '#444' }}>아직 발간된 책이 없습니다. 책 쓰기 모드에서 첫 작품을 만들어보세요.</p>
          </div>
        )}
      </div>
    </main>
  );
}
