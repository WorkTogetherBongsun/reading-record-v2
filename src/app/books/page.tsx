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
      }
    });
  }, []);

  return (
    <main className="container-layout">
      <GlobalHeader />

      <header className="header-section" style={{ textAlign: 'left', marginTop: '60px', marginBottom: '60px' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '12px' }}>나의 서재</h2>
        <p style={{ color: '#666' }}>지금까지 발간된 당신의 생각들입니다.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {books.map(book => (
          <Link href={`/view/${book.id}?uid=${user.uid}`} key={book.id} style={{ textDecoration: 'none' }}>
            <div className="card-base" style={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
              <div style={{ fontSize: '0.75rem', color: '#6366f1', marginBottom: '12px' }}>{new Date(book.createdAt).toLocaleDateString()}</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '8px', color: 'white' }}>{book.title}</h3>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>총 {book.content.length}개의 문장</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
