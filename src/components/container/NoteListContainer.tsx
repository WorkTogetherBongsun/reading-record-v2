'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { 
  ref, 
  onValue, 
  set, 
  push,
  query, 
  orderByChild,
  equalTo
} from 'firebase/database';
import { Note, RecordItem } from '@/types/note';
import NoteListPresentation from '../presentation/NoteListPresentation';

export default function NoteListContainer() {
  const [user] = useState<any>({ uid: 'default_user', displayName: '기록자' }); 
  const [notes, setNotes] = useState<Note[]>([]);
  const [recentRecords, setRecentRecords] = useState<RecordItem[]>([]);
  const [isDebug, setIsDebug] = useState(false);
  const [debugDate, setDebugDate] = useState('');
  const todayId = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!user) return;
    const notesRef = ref(db, 'notes');
    const userNotesQuery = query(notesRef, orderByChild('userId'), equalTo(user.uid));
    onValue(userNotesQuery, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const notesList = Object.keys(data).map(key => ({ ...data[key] }));
        setNotes(notesList);
        
        const allRecs: RecordItem[] = [];
        notesList.forEach(note => {
          if (note.records) {
            Object.keys(note.records).forEach(rKey => {
              allRecs.push({ id: rKey, ...note.records[rKey] });
            });
          }
        });
        // 최신순 정렬
        setRecentRecords(allRecs.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 30));
      }
    });
  }, [user]);

  const handleQuickSubmit = async (data: { content: string, tags: string, imageUrl?: string }) => {
    if (!user) return;

    const notePath = `notes/${user.uid}_${todayId}`;
    
    // 1. 오늘 날짜의 메인 노트 정보 생성/업데이트
    await set(ref(db, notePath), {
      title: `${todayId.split('-')[1]}월 ${todayId.split('-')[2]}일의 생각`,
      createdAt: new Date().toISOString(),
      id: todayId,
      userId: user.uid
    });

    // 2. 오늘의 노트 아래에 새로운 생각(레코드) 추가
    const recordsRef = ref(db, `${notePath}/records`);
    const newRecordRef = push(recordsRef);
    await set(newRecordRef, {
      content: data.content,
      tags: data.tags.split(',').map(t => t.trim()).filter(t => t !== ''),
      imageUrl: data.imageUrl || '',
      type: 'insight',
      category: '생각',
      createdAt: new Date().toISOString(),
      userId: user.uid
    });
  };

  const handleStartRecord = async (targetId?: string) => {
    const finalId = targetId || todayId;
    window.location.href = `/record/${finalId}`;
  };

  return (
    <NoteListPresentation 
      notes={notes}
      recentRecords={recentRecords}
      todayId={todayId}
      userDisplayName={user.displayName}
      onQuickSubmit={handleQuickSubmit}
      onLogout={() => {}}
      onToggleDebug={() => setIsDebug(!isDebug)}
      isDebug={isDebug}
      debugDate={debugDate}
      onDebugDateChange={setDebugDate}
      onStartRecord={handleStartRecord}
    />
  );
}
