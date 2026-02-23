'use client';

import { Note } from '@/types/note';

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
  onLogout
}: NoteListPresentationProps) {
  return (
    <main className="container-layout">
      <header className="header-section" onDoubleClick={onToggleDebug}>
        <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '20px'}}>
            <button onClick={onLogout} style={{background: 'none', border: '1px solid #333', color: '#666', padding: '4px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem'}}>로그아웃</button>
        </div>
        <h1 style={{fontSize: '3rem'}}>🌙</h1>
        <h2 style={{fontSize: '2rem', color: 'white', marginBottom: '8px'}}>Night Reading</h2>
        <p>{userDisplayName}님의 밤이 기록으로 남는 공간</p>
      </header>

      {/* Stats Summary - Simplified for now */}
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '40px'}}>
        <div className="card-base" style={{padding: '20px', textAlign: 'center'}}>
          <span style={{color: '#a0a0a0', fontSize: '0.8rem'}}>총 기록 일수</span>
          <p style={{fontSize: '1.8rem', fontWeight: 'bold', margin: '8px 0', color: '#6366f1'}}>{notes.length}일</p>
        </div>
        <div className="card-base" style={{padding: '20px', textAlign: 'center'}}>
          <span style={{color: '#a0a0a0', fontSize: '0.8rem'}}>이번 달 기록</span>
          <p style={{fontSize: '1.8rem', fontWeight: 'bold', margin: '8px 0', color: '#fbbf24'}}>
            {notes.filter(n => n.id.startsWith(todayId.slice(0, 7))).length}회
          </p>
        </div>
      </div>

      <div className="note-list-view">
        {isDebug && (
          <div className="card-base" style={{borderColor: '#ef4444', marginBottom: '24px', padding: '24px'}}>
            <h4 style={{color: '#ef4444', marginTop: 0}}>🛠 Debug Mode</h4>
            <div style={{display: 'flex', gap: '10px'}}>
              <input 
                type="date" 
                value={debugDate} 
                onChange={(e) => onDebugDateChange(e.target.value)}
                style={{flex: 2, background: '#252525', border: '1px solid #333', color: 'white', padding: '10px', borderRadius: '8px'}}
              />
              <button 
                className="button-primary" 
                style={{flex: 1, backgroundColor: '#ef4444', padding: '10px'}}
                onClick={() => onStartRecord(debugDate)}
              >
                생성
              </button>
            </div>
          </div>
        )}

        <button 
          className="button-primary" 
          style={{ marginBottom: '48px', fontSize: '1.2rem', boxShadow: hasTodayRecord ? 'none' : '0 0 20px rgba(99, 102, 241, 0.4)' }}
          onClick={() => onStartRecord()}
        >
          {hasTodayRecord ? '🌙 오늘의 기록 이어가기' : '✨ 오늘의 기록 시작하기'}
        </button>

        <h3 style={{color: '#a0a0a0', marginBottom: '20px', fontSize: '1rem', borderBottom: '1px solid #333', paddingBottom: '10px'}}>나의 기록들</h3>
        <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
          {notes.map((note) => (
            <a href={`/record/${note.id}`} key={note.id} style={{textDecoration: 'none'}}>
              <div className="card-base" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px' }}>
                <div>
                  <span style={{fontSize: '0.8rem', color: '#6366f1', display: 'block', marginBottom: '4px'}}>
                    {note.id.split('-')[1]}월 {note.id.split('-')[2]}일
                  </span>
                  <p style={{fontSize: '1.2rem', margin: 0, color: 'white'}}>{note.title}</p>
                </div>
                <span style={{color: '#333'}}>→</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
