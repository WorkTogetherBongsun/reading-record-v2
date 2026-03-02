'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue, set, push, query, orderByChild, equalTo } from 'firebase/database';
import { Note, RecordItem } from '@/types/note';
import NoteListPresentation from '../presentation/NoteListPresentation';
import GlobalHeader from '../common/GlobalHeader';

export default function NoteListContainer() {
  const [user] = useState<any>({ uid: 'default_user', displayName: '기록자' }); 
  const [notes, setNotes] = useState<Note[]>([]);
  const [recentRecords, setRecentRecords] = useState<RecordItem[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // 1. 모든 노트(날짜) 목록 로드
  useEffect(() => {
    if (!user) return;
    const notesRef = ref(db, 'notes');
    const userNotesQuery = query(notesRef, orderByChild('userId'), equalTo(user.uid));
    onValue(userNotesQuery, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const notesList = Object.keys(data).map(key => ({ ...data[key] }));
        setNotes(notesList.sort((a, b) => b.id.localeCompare(a.id)));
      }
    });
  }, [user]);

  // 2. 선택된 날짜의 타임라인 로드
  useEffect(() => {
    if (!user || !selectedDate) return;
    const recordsPath = ref(db, `notes/${user.uid}_${selectedDate}/records`);
    onValue(recordsPath, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const recordsList = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setRecentRecords(recordsList.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      } else {
        setRecentRecords([]);
      }
    });
  }, [user, selectedDate]);

  const handleQuickSubmit = async (data: { content: string, tags: string[], imageUrl?: string }) => {
    if (!user) return;
    const notePath = `notes/${user.uid}_${selectedDate}`;
    
    // 날짜 메인 노드가 없으면 생성
    await set(ref(db, notePath), {
      title: `${selectedDate.split('-')[1]}월 ${selectedDate.split('-')[2]}일의 생각`,
      createdAt: new Date().toISOString(),
      id: selectedDate,
      userId: user.uid
    }, { /* merge equivalent */ });

    const recordsRef = ref(db, `${notePath}/records`);
    const newRecordRef = push(recordsRef);
    await set(newRecordRef, {
      content: data.content,
      tags: data.tags,
      imageUrl: data.imageUrl || '',
      type: 'insight',
      category: '생각',
      createdAt: new Date().toISOString(),
      userId: user.uid
    });
  };

  return (
    <main className="container-layout">
      <GlobalHeader />
      <NoteListPresentation 
        notes={notes}
        recentRecords={recentRecords}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onQuickSubmit={handleQuickSubmit}
        todayId={new Date().toISOString().split('T')[0]}
        userDisplayName={user.displayName}
        onLogout={() => {}}
      />
    </main>
  );
}
