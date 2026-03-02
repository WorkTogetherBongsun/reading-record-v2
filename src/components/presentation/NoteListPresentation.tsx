'use client';

import { Note, RecordItem } from '@/types/note';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

interface NoteListPresentationProps {
  notes: Note[];
  recentRecords: RecordItem[]; // 최근 작성된 모든 문장들
  todayId: string;
  userDisplayName: string;
  onQuickSubmit: (data: { content: string, tags: string }) => void;
  onLogout: () => void;
  onToggleDebug: () => void;
  isDebug: boolean;
  debugDate: string;
  onDebugDateChange: (date: string) => void;
  onStartRecord: (date?: string) => void;
}

export default function NoteListPresentation({
  notes,
  recentRecords,
  todayId,
  userDisplayName,
  onQuickSubmit,
  onLogout,
  onToggleDebug,
  isDebug,
  debugDate,
  onDebugDateChange,
  onStartRecord
}: NoteListPresentationProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { content: '', tags: '' }
  });

  const onSubmit = (data: { content: string, tags: string }) => {
    onQuickSubmit(data);
    reset();
  };

  return (
    <main className="container-layout" style={{ paddingBottom: '100px' }}>
      {/* Navigation Bar */}
      <div className="nav-bar">
        <div style={{fontWeight: 'bold', fontSize: '1.1rem', letterSpacing: '-0.5px'}}>Night Reading</div>
        <div className="nav-links">
          <Link href="/" className="active">홈</Link>
          <Link href="/write">책 쓰기</Link>
          <Link href="/books">서재</Link>
        </div>
        <div onClick={() => setIsProfileOpen(!isProfileOpen)} style={{ cursor: 'pointer', width: '30px', height: '30px', borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>👤</div>
      </div>

      {/* Quick Entry Section (트위터 스타일) */}
      <div style={{ marginTop: '40px', marginBottom: '60px' }}>
        <form onSubmit={handleSubmit(onSubmit)} className="card-base" style={{ padding: '20px', border: '1px solid #333', background: '#161616' }}>
          <textarea 
            {...register('content', { required: true })}
            placeholder="지금 어떤 생각을 하고 계신가요?"
            style={{ width: '100%', background: 'none', border: 'none', color: 'white', fontSize: '1.2rem', outline: 'none', resize: 'none', minHeight: '60px', marginBottom: '15px', fontFamily: 'inherit' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #222', paddingTop: '15px' }}>
            <input 
              {...register('tags')}
              placeholder="#태그입력 (쉼표 구분)"
              style={{ background: '#1a1a1a', border: 'none', borderRadius: '20px', padding: '6px 15px', color: '#6366f1', fontSize: '0.85rem', outline: 'none', width: '60%' }}
            />
            <button type="submit" className="button-primary" style={{ padding: '8px 20px', borderRadius: '20px', fontSize: '0.85rem' }}>
              남기기
            </button>
          </div>
        </form>
      </div>

      {/* Recent Thoughts Timeline */}
      <div className="timeline">
        <h3 style={{ fontSize: '0.9rem', color: '#555', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' }}>최근의 생각들</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {recentRecords.map((record) => (
            <div key={record.id} className="timeline-item" style={{ borderLeft: '2px solid #222', paddingLeft: '20px', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '-6px', top: '0', width: '10px', height: '10px', borderRadius: '50%', background: '#6366f1' }} />
              <div style={{ marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: '#444', fontWeight: 'bold' }}>{record.createdAt?.slice(5, 10).replace('-', '/')}</span>
                {record.tags?.map(tag => (
                  <span key={tag} style={{ fontSize: '0.75rem', color: '#6366f1', marginLeft: '10px' }}>#{tag}</span>
                ))}
              </div>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#eee', margin: 0 }}>{record.content}</p>
            </div>
          ))}
          {recentRecords.length === 0 && <p style={{color: '#333', textAlign: 'center', padding: '40px 0'}}>아직 남겨진 생각이 없습니다.</p>}
        </div>
      </div>

      {/* Fixed Navigation for structural view */}
      <div style={{ position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '12px', zIndex: 100 }}>
        <Link href="/write" style={{ textDecoration: 'none' }}>
          <button className="button-primary" style={{ padding: '12px 24px', borderRadius: '30px', background: '#1e1e1e', border: '1px solid #4f46e5', color: '#4f46e5' }}>
            ✍️ 책으로 엮기
          </button>
        </Link>
      </div>
    </main>
  );
}
