'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { Book } from '@/types/note';
import Link from 'next/link';

export default function BookShelf() {
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
    <main className="container-layout" style={{paddingTop: '100px'}}>
      <div className="nav-bar">
        <div style={{fontWeight: 'bold', fontSize: '1.2rem'}}>Book Maker <span style={{fontSize: '0.8rem', color: '#6366f1'}}>Beta</span></div>
        <div className="nav-links">
          <Link href="/">홈</Link>
          <Link href="/write">책 쓰기</Link>
          <Link href="/books" className="active">서재</Link>
        </div>
      </div>

      <header className="header-section" style={{textAlign: 'left', marginBottom: '60px'}}>
        <h2 style={{fontSize: '2.5rem', marginBottom: '12px'}}>나의 서재</h2>
        <p style={{color: '#666'}}>지금까지 발간된 당신의 생각들입니다.</p>
      </header>

      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px'}}>
        {books.map(book => (
          <Link href={`/view/${book.id}?uid=${user.uid}`} key={book.id} style={{textDecoration: 'none'}}>
            <div className="card-base" style={{height: '100%', position: 'relative', overflow: 'hidden'}}>
              <div style={{fontSize: '0.75rem', color: '#6366f1', marginBottom: '12px'}}>{new Date(book.createdAt).toLocaleDateString()}</div>
              <h3 style={{fontSize: '1.5rem', marginBottom: '8px', color: 'white'}}>{book.title}</h3>
              <p style={{color: '#666', fontSize: '0.9rem'}}>총 {book.content.length}개의 문장</p>
              
              <div style={{marginTop: '24px', fontSize: '0.85rem', color: '#888', display: 'flex', alignItems: 'center', gap: '8px'}}>
                <span>상세 보기</span>
                <span>→</span>
              </div>
            </div>
          </Link>
        ))}
        {books.length === 0 && (
          <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '100px 0', border: '1px dashed #333', borderRadius: '20px'}}>
            <p style={{color: '#444'}}>아직 발간된 책이 없습니다. [책 쓰기]에서 첫 작품을 만들어보세요.</p>
          </div>
        )}
      </div>
    </main>
  );
}
