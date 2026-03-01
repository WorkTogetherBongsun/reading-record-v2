'use client';

import { Note } from '@/types/note';
import Link from 'next/link';
import { useState } from 'react';

interface NoteListPresentationProps {
  notes: Note[];
  todayId: string;
  hasTodayRecord: boolean;
  isDebug: boolean;
  debugDate: string;
  onStartRecord: (date?: string) => void;
  onToggleDebug: () => void;
  onDebugDateChange: (date: string) => void;
  userDisplayName: string;
  onLogout: () => void;
  geminiKey: string;
  onSaveApiKey: (key: string) => void;
}

export default function NoteListPresentation({
  notes,
  todayId,
  hasTodayRecord,
  isDebug,
  debugDate,
  onStartRecord,
  onToggleDebug,
  onDebugDateChange,
  userDisplayName,
  onLogout,
  geminiKey,
  onSaveApiKey
}: NoteListPresentationProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [tempKey, setTempKey] = useState(geminiKey);

  return (
    <main className="container-layout" style={{ paddingBottom: '120px' }}>
      {/* Navigation Bar */}
      <div className="nav-bar">
        <div style={{fontWeight: 'bold', fontSize: '1.2rem'}}>Book Maker <span style={{fontSize: '0.8rem', color: '#6366f1'}}>Beta</span></div>
        <div className="nav-links">
          <Link href="/" className="active">홈</Link>
          <Link href="/write">책 쓰기</Link>
          <Link href="/books">서재</Link>
        </div>
        <div 
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          style={{ cursor: 'pointer', width: '32px', height: '32px', borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}
        >
          👤
        </div>
      </div>

      {/* Profile Sidebar/Overlay */}
      {isProfileOpen && (
        <div className="card-base" style={{ position: 'fixed', top: '70px', right: '24px', width: '300px', zIndex: 1000, boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
          <h4 style={{ margin: '0 0 16px 0' }}>설정</h4>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '0.8rem', color: '#888', display: 'block', marginBottom: '8px' }}>Gemini API Key</label>
            <input 
              type="password" 
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              placeholder="AI 기능을 위한 키를 입력하세요"
              style={{ width: '100%', background: '#121212', border: '1px solid #333', color: 'white', padding: '10px', borderRadius: '8px', outline: 'none' }}
            />
            <button 
              onClick={() => onSaveApiKey(tempKey)}
              className="button-primary" 
              style={{ marginTop: '12px', padding: '8px', width: '100%', fontSize: '0.8rem' }}
            >
              저장하기
            </button>
          </div>
          <button onClick={onLogout} style={{ width: '100%', background: 'none', border: '1px solid #333', color: '#ef4444', padding: '8px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' }}>로그아웃</button>
        </div>
      )}

      <header className="header-section" onDoubleClick={onToggleDebug} style={{marginTop: '40px'}}>
        <h1 style={{fontSize: '3.5rem', marginBottom: '16px'}}>🌙</h1>
        <h2 style={{fontSize: '2.5rem', color: 'white', marginBottom: '8px', fontWeight: 'bold'}}>Night Reading</h2>
        <p style={{fontSize: '1.1rem', color: '#888'}}>{userDisplayName}님의 사유가 기록되는 밤입니다</p>
      </header>

      {/* Dashboard Stats */}
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '48px'}}>
        <div className="card-base" style={{padding: '30px', textAlign: 'center', background: 'linear-gradient(145deg, #1a1a1a, #151515)'}}>
          <span style={{color: '#666', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px'}}>총 기록 일수</span>
          <p style={{fontSize: '2.5rem', fontWeight: 'bold', margin: '12px 0', color: '#6366f1'}}>{notes.length}</p>
        </div>
        <div className="card-base" style={{padding: '30px', textAlign: 'center', background: 'linear-gradient(145deg, #1a1a1a, #151515)'}}>
          <span style={{color: '#666', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px'}}>이번 달 기록</span>
          <p style={{fontSize: '2.5rem', fontWeight: 'bold', margin: '12px 0', color: '#fbbf24'}}>
            {notes.filter(n => n.id.startsWith(todayId.slice(0, 7))).length}
          </p>
        </div>
      </div>

      <div className="note-list-view">
        {isDebug && (
          <div className="card-base" style={{borderColor: '#ef4444', marginBottom: '32px', padding: '24px', background: 'rgba(239, 68, 68, 0.05)'}}>
            <h4 style={{color: '#ef4444', marginTop: 0, marginBottom: '16px'}}>🛠 Debug Mode: 과거 기록 생성</h4>
            <div style={{display: 'flex', gap: '12px'}}>
              <input 
                type="date" 
                value={debugDate} 
                onChange={(e) => onDebugDateChange(e.target.value)}
                style={{flex: 2, background: '#121212', border: '1px solid #333', color: 'white', padding: '12px', borderRadius: '8px', outline: 'none'}}
              />
              <button 
                className="button-primary" 
                style={{flex: 1, backgroundColor: '#ef4444'}}
                onClick={() => onStartRecord(debugDate)}
              >
                생성
              </button>
            </div>
          </div>
        )}

        <button 
          className="button-primary" 
          style={{ 
            width: '100%',
            padding: '24px',
            borderRadius: '16px',
            fontSize: '1.25rem', 
            marginBottom: '64px',
            background: hasTodayRecord ? '#1e1e1e' : '#6366f1',
            boxShadow: hasTodayRecord ? 'none' : '0 10px 40px rgba(99, 102, 241, 0.3)',
            border: hasTodayRecord ? '1px solid #333' : 'none'
          }}
          onClick={() => onStartRecord()}
        >
          {hasTodayRecord ? '🌙 오늘의 밤 기록 이어가기' : '✨ 새로운 밤의 기록 시작하기'}
        </button>

        <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
          {notes.map((note) => (
            <Link href={`/record/${note.id}`} key={note.id} style={{textDecoration: 'none'}}>
              <div className="card-base" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px' }}>
                <div>
                  <span style={{fontSize: '0.8rem', color: '#6366f1', fontWeight: '600', display: 'block', marginBottom: '6px', letterSpacing: '0.5px'}}>
                    {note.id.replace(/-/g, '. ')}
                  </span>
                  <p style={{fontSize: '1.3rem', margin: 0, color: 'white', fontWeight: '500'}}>{note.title}</p>
                </div>
                <div style={{color: '#333', fontSize: '1.5rem'}}>→</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Floating Action Buttons for quick navigation */}
      <div style={{ position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '12px', zIndex: 100 }}>
        <Link href="/write" style={{ textDecoration: 'none' }}>
          <button className="button-primary" style={{ padding: '12px 24px', borderRadius: '30px', background: '#1e1e1e', border: '1px solid #4f46e5', color: '#4f46e5' }}>
            ✍️ 책 쓰기
          </button>
        </Link>
        <Link href="/books" style={{ textDecoration: 'none' }}>
          <button className="button-primary" style={{ padding: '12px 24px', borderRadius: '30px', background: '#1e1e1e', border: '1px solid #fbbf24', color: '#fbbf24' }}>
            📚 서재 보기
          </button>
        </Link>
      </div>
    </main>
  );
}
