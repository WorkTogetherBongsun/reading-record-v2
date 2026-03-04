'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue, push, set } from 'firebase/database';
import { RecordItem } from '@/types/note';
import { getSentenceFeedback, AiFeedback } from '@/lib/gemini';
import GlobalHeader from '@/components/common/GlobalHeader';

export default function BookWriteContainer() {
  const [user] = useState({ uid: 'default_user', displayName: '기록자' });
  const [allRecords, setAllRecords] = useState<RecordItem[]>([]);
  const [selectedSentences, setSelectedSentences] = useState<{content: string, feedback?: AiFeedback}[]>([]);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const [bookTitle, setBookTitle] = useState('');

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

  const requestFeedback = async (content: string, index: number) => {
    setIsLoadingFeedback(true);
    try {
      const feedback = await getSentenceFeedback(content);
      const newSentences = [...selectedSentences];
      newSentences[index] = { ...newSentences[index], feedback };
      setSelectedSentences(newSentences);
    } catch (err) {
      alert(err instanceof Error ? err.message : '피드백 로드 실패');
    } finally {
      setIsLoadingFeedback(false);
    }
  };

  const applySuggestion = (index: number) => {
    const sentence = selectedSentences[index];
    if (sentence.feedback) {
      const newSentences = [...selectedSentences];
      newSentences[index] = { content: sentence.feedback.suggestion, feedback: undefined };
      setSelectedSentences(newSentences);
    }
  };

  return (
    <div className="book-write-layout" style={{ display: 'flex', gap: '30px', minHeight: '80vh' }}>
      {/* Left: Inventory */}
      <aside style={{ width: '280px', flexShrink: 0, borderRight: '1px solid #222', paddingRight: '20px' }}>
        <h3 style={{ fontSize: '0.9rem', color: '#555', marginBottom: '20px' }}>생각 조각들</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {allRecords.map(r => (
            <div 
              key={r.id} 
              className="card-base" 
              style={{ padding: '12px', cursor: 'pointer', fontSize: '0.85rem' }}
              onClick={() => setSelectedSentences(prev => [...prev, { content: r.content }])}
            >
              {r.content.substring(0, 40)}...
            </div>
          ))}
        </div>
      </aside>

      {/* Main: Drafting Area */}
      <section style={{ flex: 1 }}>
        <input 
          type="text" 
          placeholder="책 제목을 입력하세요" 
          value={bookTitle}
          onChange={(e) => setBookTitle(e.target.value)}
          style={{ width: '100%', background: 'none', border: 'none', color: 'white', fontSize: '2rem', fontWeight: 'bold', marginBottom: '40px', outline: 'none' }}
        />

        <div className="editor-area">
          {selectedSentences.map((item, idx) => (
            <div key={idx} style={{ marginBottom: '30px', position: 'relative' }}>
              <div 
                style={{ 
                  fontSize: '1.2rem', lineHeight: '1.7', color: '#eee', padding: '10px', 
                  borderRadius: '8px', border: '1px solid transparent',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#333')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}
              >
                {item.content}
                <button 
                  onClick={() => requestFeedback(item.content, idx)}
                  style={{ marginLeft: '10px', background: '#222', border: 'none', borderRadius: '4px', color: '#6366f1', fontSize: '0.7rem', padding: '4px 8px', cursor: 'pointer' }}
                >
                  ✨ AI 리뷰
                </button>
              </div>

              {item.feedback && (
                <div style={{ marginTop: '12px', padding: '20px', background: '#161616', borderRadius: '12px', borderLeft: '4px solid #6366f1' }}>
                  <div style={{ marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 'bold' }}>GOOD</span>
                    <p style={{ fontSize: '0.85rem', color: '#aaa', margin: '4px 0' }}>{item.feedback.compliment}</p>
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 'bold' }}>THINK</span>
                    <p style={{ fontSize: '0.85rem', color: '#aaa', margin: '4px 0' }}>{item.feedback.improvement}</p>
                  </div>
                  <div style={{ background: '#1e1e1e', padding: '12px', borderRadius: '8px', border: '1px dashed #333' }}>
                    <p style={{ fontSize: '0.9rem', color: '#fff', margin: '0 0 10px 0', fontStyle: 'italic' }}>"{item.feedback.suggestion}"</p>
                    <button 
                      onClick={() => applySuggestion(idx)}
                      style={{ background: '#6366f1', border: 'none', borderRadius: '4px', color: 'white', fontSize: '0.75rem', padding: '4px 12px', cursor: 'pointer' }}
                    >
                      이 문장으로 교체하기
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {selectedSentences.length === 0 && <p style={{ color: '#333' }}>왼쪽에서 문장을 선택하거나 직접 작성해보세요.</p>}
        </div>
      </section>
    </div>
  );
}
