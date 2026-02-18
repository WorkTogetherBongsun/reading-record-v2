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

interface Note {
  id: string;
  title: string;
  createdAt: any;
}

interface Record {
  id: string;
  content: string;
  bookTitle?: string;
  type: 'insight' | 'quote';
  createdAt: any;
}

export default function Home() {
  // 상태 관리
  const [notes, setNotes] = useState<Note[]>([]); // 일별 기록 (부모)
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null); // 선택된 기록 ID
  const [records, setRecords] = useState<Record[]>([]); // 선택된 기록의 상세 문장들
  
  // 입력 폼 상태
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [content, setContent] = useState('');
  const [bookTitle, setBookTitle] = useState('');
  const [type, setType] = useState<'insight' | 'quote'>('insight');
  const [isAddingNote, setIsAddingNote] = useState(false);

  // 1. 일별 기록 목록(Notes) 실시간 구독
  useEffect(() => {
    const q = query(collection(db, 'notes'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Note[];
      setNotes(data);
    });
    return () => unsubscribe();
  }, []);

  // 2. 선택된 기록의 상세 문장들(Records) 실시간 구독
  useEffect(() => {
    if (!selectedNoteId) {
      setRecords([]);
      return;
    }

    const q = query(
      collection(db, `notes/${selectedNoteId}/records`), 
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
  }, [selectedNoteId]);

  // 새 기록(Note) 생성
  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle) return;
    try {
      const docRef = await addDoc(collection(db, 'notes'), {
        title: newNoteTitle,
        createdAt: serverTimestamp()
      });
      setNewNoteTitle('');
      setIsAddingNote(false);
      setSelectedNoteId(docRef.id); // 생성 후 바로 선택
    } catch (err) {
      console.error(err);
    }
  };

  // 상세 문장(Record) 추가
  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content || !selectedNoteId) return;
    try {
      await addDoc(collection(db, `notes/${selectedNoteId}/records`), {
        content,
        bookTitle,
        type,
        createdAt: serverTimestamp()
      });
      setContent('');
      setBookTitle('');
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (createdAt: any) => {
    if (!createdAt) return '';
    const date = createdAt instanceof Timestamp ? createdAt.toDate() : new Date(createdAt);
    return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
  };

  return (
    <main className="container">
      <header className="header">
        <h1 onClick={() => setSelectedNoteId(null)} style={{cursor: 'pointer'}}>🌙 Night Reading</h1>
        <p>{selectedNoteId ? '기록을 채워보세요' : '오늘 밤, 당신의 마음을 스친 문장들'}</p>
      </header>

      {!selectedNoteId ? (
        // --- 메인: 기록 리스트 ---
        <div className="note-list-view">
          <button 
            className="submit-btn" 
            style={{marginBottom: '24px'}}
            onClick={() => setIsAddingNote(!isAddingNote)}
          >
            {isAddingNote ? '취소' : '+ 오늘 기록 시작하기'}
          </button>

          {isAddingNote && (
            <form onSubmit={handleCreateNote} className="form-card" style={{marginBottom: '24px'}}>
              <input
                type="text"
                placeholder="오늘 기록의 제목을 정해주세요 (예: 2월 18일의 생각)"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                autoFocus
              />
              <button type="submit" className="submit-btn">생성하기</button>
            </form>
          )}

          <div className="record-list">
            {notes.map((note) => (
              <div key={note.id} className="record-item" onClick={() => setSelectedNoteId(note.id)} style={{cursor: 'pointer'}}>
                <div className="footer">
                  <span style={{fontSize: '0.8rem', color: '#6366f1'}}>{formatDate(note.createdAt)}</span>
                </div>
                <p className="content" style={{fontSize: '1.4rem', margin: '8px 0'}}>{note.title}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // --- 상세: 선택된 기록의 문장들 ---
        <div className="note-detail-view">
          <button className="back-btn" onClick={() => setSelectedNoteId(null)} style={{marginBottom: '16px', background: 'none', border: 'none', color: '#a0a0a0', cursor: 'pointer'}}>
            ← 목록으로 돌아가기
          </button>
          
          <form onSubmit={handleAddRecord} className="form-card">
            <div className="type-selector">
              <button type="button" onClick={() => setType('insight')} className={type === 'insight' ? 'active' : ''}>💡 깨달음</button>
              <button type="button" onClick={() => setType('quote')} className={type === 'quote' ? 'active' : ''}>📖 문장</button>
            </div>
            <textarea
              placeholder={type === 'insight' ? "무엇을 깨달았나요?" : "어떤 문장이 남았나요?"}
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <input
              type="text"
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
      )}
    </main>
  );
}
