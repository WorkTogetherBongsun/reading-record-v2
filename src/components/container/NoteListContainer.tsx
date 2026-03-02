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
  equalTo,
  serverTimestamp,
  limitToLast
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

  // 1. 일 단위 기록 목록 로드
  useEffect(() => {
    if (!user) return;
    const notesRef = ref(db, 'notes');
    const userNotesQuery = query(notesRef, orderByChild('userId'), equalTo(user.uid));
    onValue(userNotesQuery, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const notesList = Object.keys(data).map(key => ({ ...data[key] }));
        setNotes(notesList);
        
        // 2. 최근 모든 문장(Records) 수집하여 타임라인 생성
        const allRecs: RecordItem[] = [];
        notesList.forEach(note => {
          if (note.records) {
            Object.keys(note.records).forEach(rKey => {
              allRecs.push({ id: rKey, ...note.records[rKey] });
            });
          }
        });
        setRecentRecords(allRecs.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 20));
      }
    });
  }, [user]);

  const handleQuickSubmit = async (data: { content: string, tags: string }) => {
    if (!user) return;

    // 1. 오늘 날짜의 노트가 있는지 먼저 확인 및 생성
    const notePath = `notes/${user.uid}_${todayId}`;
    await set(ref(db, notePath), {
      title: `${todayId.split('-')[1]}월 ${todayId.split('-')[2]}일의 생각`,
      createdAt: new Date().toISOString(),
      id: todayId,
      userId: user.uid
    }, { /* merge equivalent in set */ });

    // 2. 오늘의 노트 아래에 레코드 추가
    const recordsRef = ref(db, `${notePath}/records`);
    const newRecordRef = push(recordsRef);
    await set(newRecordRef, {
      content: data.content,
      tags: data.tags.split(',').map(t => t.trim()).filter(t => t !== ''),
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
