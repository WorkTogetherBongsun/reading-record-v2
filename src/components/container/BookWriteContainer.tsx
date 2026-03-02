'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue, push, set } from 'firebase/database';
import { RecordItem } from '@/types/note';
import Link from 'next/link';

export default function BookWriteContainer() {
  const [user] = useState({ uid: 'default_user', displayName: '기록자' });
  const [allRecords, setAllRecords] = useState<RecordItem[]>([]);
  const [selectedSentences, setSelectedSentences] = useState<string[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [bookTitle, setBookTitle] = useState('');
  const [isWriting, setIsWriting] = useState(false);

  useEffect(() => {
    const notesRef = ref(db, 'notes');
    onValue(notesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const records: RecordItem[] = [];
        Object.keys(data).forEach(noteKey => {
          if (noteKey.includes(user.uid)) {
            const dayRecords = data[noteKey].records;
            if (dayRecords) {
              Object.keys(dayRecords).forEach(rKey => {
                records.push({ id: rKey, ...dayRecords[rKey] });
              });
            }
          }
        });
        setAllRecords(records.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      }
    });
  }, []);

  const handleAiRequest = (content: string) => {
    setIsWriting(true);
    setTimeout(() => {
      setAiSuggestions([
        `[확장판] ${content}에 대해 더 깊이 사색해보았습니다...`,
        `[자료조사] 이 내용은 최근 행동 경제학에서 다루는...`,
        `[글쓰기 방안] 에세이 형식으로 풀어나가고 싶다면...`
      ]);
      setIsWriting(false);
    }, 1500);
  };

  const handleSaveBook = async () => {
    if (!bookTitle || selectedSentences.length === 0) return;
    const booksRef = ref(db, `books/${user.uid}`);
    const newBookRef = push(booksRef);
    await set(newBookRef, {
      title: bookTitle,
      author: user.displayName,
      content: selectedSentences,
      createdAt: new Date().toISOString(),
      userId: user.uid,
      highlights: {}
    });
    alert('책이 성공적으로 발간되었습니다!');
    window.location.href = '/books';
  };

  return (
    <div className="book-write-layout" style={{ display: 'flex', gap: '40px' }}>
      <aside style={{ width: '300px', flexShrink: 0 }}>
        <h3 style={{ marginBottom: '20px', fontSize: '1rem', color: '#555' }}>기록 보관함</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {allRecords.map(r => (
            <div 
              key={r.id} 
              className="card-base" 
              style={{ padding: '16px', cursor: 'pointer', opacity: selectedSentences.includes(r.content) ? 0.4 : 1 }}
              onClick={() => setSelectedSentences(prev => [...prev, r.content])}
            >
              <p style={{ fontSize: '0.9rem', margin: 0 }}>{r.content}</p>
            </div>
          ))}
        </div>
      </aside>

      <section style={{ flex: 1 }}>
        <input 
          type="text" 
          placeholder="책 제목을 입력하세요" 
          value={bookTitle}
          onChange={(e) => setBookTitle(e.target.value)}
          style={{ width: '100%', background: 'none', border: 'none', color: 'white', fontSize: '2rem', fontWeight: 'bold', marginBottom: '30px', outline: 'none' }}
        />
        <div className="editor-area" style={{ minHeight: '300px' }}>
          {selectedSentences.map((s, idx) => (
            <p key={idx} style={{ marginBottom: '10px' }}>{s}</p>
          ))}
        </div>
        <button className="button-primary" onClick={handleSaveBook}>책 발간하기</button>
      </section>
    </div>
  );
}
