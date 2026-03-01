'use client';

import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { 
  ref, 
  onValue, 
  set, 
  query, 
  orderByChild,
  equalTo,
  serverTimestamp 
} from 'firebase/database';
import { Note } from '@/types/note';
import NoteListPresentation from '../presentation/NoteListPresentation';

export default function NoteListContainer() {
  const [user, setUser] = useState<any>({ uid: 'default_user', displayName: '기록자' }); 
  const [notes, setNotes] = useState<Note[]>([]);
  const [isDebug, setIsDebug] = useState(false);
  const [debugDate, setDebugDate] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const todayId = new Date().toISOString().split('T')[0];

  useEffect(() => {
    // 로컬 스토리지에서 API 키 불러오기
    const savedKey = localStorage.getItem('gemini_api_key') || '';
    setGeminiKey(savedKey);
  }, []);

  const handleSaveApiKey = (key: string) => {
    localStorage.setItem('gemini_api_key', key);
    setGeminiKey(key);
    alert('API 키가 브라우저에 안전하게 저장되었습니다. 이제 AI 기능을 사용할 수 있습니다! 🐶');
    window.location.reload(); // 키 적용을 위해 새로고침
  };

  useEffect(() => {
    if (!user) {
      setNotes([]);
      return;
    }

    const notesRef = ref(db, 'notes');
    const userNotesQuery = query(notesRef, orderByChild('userId'), equalTo(user.uid));

    const unsubscribe = onValue(userNotesQuery, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const notesList = Object.keys(data).map(key => ({
          ...data[key]
        })).sort((a, b) => b.id.localeCompare(a.id));
        setNotes(notesList);
      } else {
        setNotes([]);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleStartRecord = async (targetId?: string) => {
    if (!user) return;
    const finalId = targetId || todayId;
    const [y, m, d] = finalId.split('-');
    
    const notePath = `notes/${user.uid}_${finalId}`;
    await set(ref(db, notePath), {
      title: `${m}월 ${d}일의 밤`,
      createdAt: serverTimestamp(),
      id: finalId,
      userId: user.uid
    });
    
    window.location.href = `/record/${finalId}`;
  };

  const hasTodayRecord = notes.some(n => n.id === todayId);

  return (
    <NoteListPresentation 
      notes={notes}
      todayId={todayId}
      hasTodayRecord={hasTodayRecord}
      isDebug={isDebug}
      debugDate={debugDate}
      onStartRecord={handleStartRecord}
      onToggleDebug={() => setIsDebug(!isDebug)}
      onDebugDateChange={setDebugDate}
      userDisplayName={user.displayName}
      onLogout={() => alert('로그아웃 기능이 비활성화 상태입니다.')}
      geminiKey={geminiKey}
      onSaveApiKey={handleSaveApiKey}
    />
  );
}
