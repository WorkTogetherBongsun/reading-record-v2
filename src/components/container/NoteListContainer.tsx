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
  get,
  update
} from 'firebase/database';
import { Note, RecordItem } from '@/types/note';
import NoteListPresentation from '../presentation/NoteListPresentation';
import GlobalHeader from '../common/GlobalHeader';

export default function NoteListContainer() {
  const [user] = useState<any>({ uid: 'default_user', displayName: '기록자' }); 
  const [notes, setNotes] = useState<Note[]>([]);
  const [recentRecords, setRecentRecords] = useState<RecordItem[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (!user) return;
    const notesRef = ref(db, 'notes');
    const userNotesQuery = query(notesRef, orderByChild('userId'), equalTo(user.uid));
    const unsubscribe = onValue(userNotesQuery, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const notesList = Object.keys(data).map(key => ({ ...data[key] }));
        setNotes(notesList.sort((a, b) => b.id.localeCompare(a.id)));
      }
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user || !selectedDate) return;
    const recordsPath = ref(db, `notes/${user.uid}_${selectedDate}/records`);
    const unsubscribe = onValue(recordsPath, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const recordsList = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        // 타임라인은 최신순 정렬
        setRecentRecords(recordsList.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      } else {
        setRecentRecords([]);
      }
    });
    return () => unsubscribe();
  }, [user, selectedDate]);

  const handleQuickSubmit = async (data: { content: string, tags: string[], imageUrl?: string }) => {
    if (!user) return;
    const notePath = `notes/${user.uid}_${selectedDate}`;
    
    // 1. 해당 날짜 노드가 있는지 먼저 확인 (기존 데이터 보호)
    const noteSnap = await get(ref(db, notePath));
    if (!noteSnap.exists()) {
        await set(ref(db, notePath), {
            title: `${selectedDate.split('-')[1]}월 ${selectedDate.split('-')[2]}일의 생각`,
            createdAt: new Date().toISOString(),
            id: selectedDate,
            userId: user.uid
        });
    }

    // 2. 새로운 글(Record) 추가
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
    <main className="container-layout" style={{ paddingTop: '80px' }}>
      <GlobalHeader />
      <NoteListPresentation 
        notes={notes}
        recentRecords={recentRecords}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onQuickSubmit={handleQuickSubmit}
        userDisplayName={user.displayName}
      />
    </main>
  );
}
