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
  const todayId = new Date().toISOString().split('T')[0];

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
    />
  );
}
