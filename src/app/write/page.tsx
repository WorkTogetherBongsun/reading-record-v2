'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue, push, set, serverTimestamp } from 'firebase/database';
import { RecordItem } from '@/types/note';
import Link from 'next/link';

export default function BookWriteContainer() {
  const [user] = useState({ uid: 'default_user', displayName: '기록자' });
  const [allRecords, setAllRecords] = useState<RecordItem[]>([]);
  const [selectedSentences, setSelectedSentences] = useState<string[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [bookTitle, setBookTitle] = useState('');
  const [isWriting, setIsWriting] = useState(false);

  // 1. 모든 기록 가져오기
  useEffect(() => {
    const recordsRef = ref(db, 'notes');
    onValue(recordsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const records: RecordItem[] = [];
        Object.keys(data).forEach(noteKey => {
          if (noteKey.startsWith(user.uid)) {
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

  // 2. AI에게 글쓰기 제안 요청 (시뮬레이션)
  const handleAiRequest = (content: string) => {
    setIsWriting(true);
    // 실제 API 호출 대신 시뮬레이션
    setTimeout(() => {
      setAiSuggestions([
        `[확장판] ${content}에 대해 더 깊이 사색해보았습니다. 이 문장은 삶의 철학적 깊이를 더해주는 중요한 단초가 될 수 있습니다. 관련하여 라이너 마리아 릴케의 시 구절을 인용해보면 어떨까요?`,
        `[자료조사] 이 내용은 최근 행동 경제학에서 다루는 '선택의 패러독스'와 맞닿아 있습니다. 관련 서적으로는 배리 슈워츠의 저서를 추천합니다.`,
        `[글쓰기 방안] 에세이 형식으로 풀어나가고 싶다면, 이 문장을 도입부에 배치하여 독자의 호기심을 자극하는 전략을 추천합니다.`
      ]);
      setIsWriting(false);
    }, 1500);
  };

  // 3. 책으로 저장하기
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
    alert('책이 성공적으로 발간되었습니다! 서재에서 확인하세요.');
    window.location.href = '/books';
  };

  return (
    <main className="book-write-page" style={{ display: 'flex', height: '100vh', paddingTop: '60px' }}>
      {/* Navigation - Temporary internal nav */}
      <div className="nav-bar">
        <div style={{fontWeight: 'bold', fontSize: '1.2rem'}}>Book Maker <span style={{fontSize: '0.8rem', color: '#6366f1'}}>Beta</span></div>
        <div className="nav-links">
          <Link href="/">홈</Link>
          <Link href="/write" className="active">책 쓰기</Link>
          <Link href="/books">서재</Link>
        </div>
      </div>

      {/* Left Sidebar: All Records */}
      <aside style={{ width: '350px', borderRight: '1px solid #262626', padding: '24px', overflowY: 'auto', backgroundColor: '#0f0f0f' }}>
        <h3 style={{ marginBottom: '20px', fontSize: '1.1rem' }}>내 기록 보관함</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {allRecords.map(r => (
            <div 
              key={r.id} 
              className="card-base" 
              style={{ padding: '16px', cursor: 'pointer', opacity: selectedSentences.includes(r.content) ? 0.4 : 1 }}
              onClick={() => setSelectedSentences(prev => [...prev, r.content])}
            >
              <span className={`badge-label ${r.type}`} style={{marginBottom: '8px'}}>{r.type}</span>
              <p style={{ fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>{r.content}</p>
              <button 
                onClick={(e) => { e.stopPropagation(); handleAiRequest(r.content); }}
                style={{ marginTop: '10px', background: 'none', border: '1px solid #333', color: '#6366f1', fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
              >
                AI 어시스턴트 호출
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content: Editor & AI */}
      <section style={{ flex: 1, padding: '40px', backgroundColor: '#121212', overflowY: 'auto' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <input 
            type="text" 
            placeholder="책 제목을 입력하세요..." 
            value={bookTitle}
            onChange={(e) => setBookTitle(e.target.value)}
            style={{ width: '100%', background: 'none', border: 'none', color: 'white', fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '40px', outline: 'none' }}
          />

          <div className="editor-area" style={{ minHeight: '400px', fontSize: '1.1rem', lineHeight: '1.8' }}>
            {selectedSentences.length === 0 && <p style={{color: '#444'}}>왼쪽 보관함에서 문장을 선택하여 책을 구성하세요.</p>}
            {selectedSentences.map((s, idx) => (
              <div 
                key={idx} 
                className="sentence-item" 
                style={{ marginBottom: '16px', padding: '8px', borderRadius: '8px', transition: 'background 0.2s', position: 'relative' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1e1e1e')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {s}
                <button 
                  onClick={() => setSelectedSentences(prev => prev.filter((_, i) => i !== idx))}
                  style={{ position: 'absolute', right: '-30px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                >✕</button>
              </div>
            ))}
          </div>

          {/* AI Suggestions Box */}
          {(isWriting || aiSuggestions.length > 0) && (
            <div style={{ marginTop: '60px', padding: '24px', backgroundColor: '#1a1a1a', borderRadius: '16px', border: '1px solid #333' }}>
              <h4 style={{ color: '#6366f1', marginTop: 0, marginBottom: '16px' }}>✨ AI의 제안</h4>
              {isWriting ? <p style={{color: '#666'}}>생각하는 중...</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {aiSuggestions.map((sug, i) => (
                    <p key={i} style={{ fontSize: '0.9rem', color: '#ccc', margin: 0, paddingBottom: '12px', borderBottom: '1px solid #222' }}>{sug}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          <div style={{ marginTop: '80px', textAlign: 'center' }}>
            <button className="button-primary" style={{ padding: '16px 40px', fontSize: '1.1rem' }} onClick={handleSaveBook}>
              📖 이 구성으로 책 발간하기
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
