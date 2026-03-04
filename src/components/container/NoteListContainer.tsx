'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue, set, push, query, orderByChild, equalTo, get } from 'firebase/database';
import { Note, RecordItem } from '@/types/note';
import NoteListPresentation from '../presentation/NoteListPresentation';
import GlobalHeader from '../common/GlobalHeader';
import { getSentenceFeedback, AiFeedback } from '@/lib/gemini';

export default function NoteListContainer() {
  const [user] = useState<any>({ uid: 'default_user', displayName: '기록자' }); 
  const [notes, setNotes] = useState<Note[]>([]);
  const [recentRecords, setRecentRecords] = useState<RecordItem[]>([]);
  const todayId = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayId);

  // 1. 모든 노트(날짜 버튼용) 로드
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

  // 2. 선택된 날짜의 타임라인 로드
  useEffect(() => {
    if (!user || !selectedDate) return;
    const recordsPath = ref(db, `notes/${user.uid}_${selectedDate}/records`);
    const unsubscribe = onValue(recordsPath, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const recordsList = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setRecentRecords(recordsList.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      } else {
        setRecentRecords([]);
      }
    });
    return () => unsubscribe();
  }, [user, selectedDate]);

  const handleAiFeedback = async (text: string): Promise<AiFeedback | null> => {
    try {
      return await getSentenceFeedback(text);
    } catch (err: any) {
      alert(err.message);
      return null;
    }
  };

  const handleQuickSubmit = async (data: { content: string, tags: string[], imageUrl?: string }) => {
    if (!user) return;
    
    // 유저 ID와 선택된 날짜를 조합한 고유 경로 (데이터 중첩/유실 방지)
    const notePath = `notes/${user.uid}_${selectedDate}`;
    
    try {
      // 1. 해당 날짜의 메인 정보가 없으면 생성 (덮어쓰기 방지를 위해 get 후 조건부 set)
      const noteRef = ref(db, notePath);
      const noteSnap = await get(noteRef);
      
      if (!noteSnap.exists()) {
        await set(noteRef, {
          title: `${selectedDate.split('-')[1]}월 ${selectedDate.split('-')[2]}일의 생각`,
          createdAt: new Date().toISOString(),
          id: selectedDate,
          userId: user.uid
        });
      }

      // 2. 새로운 글(Record) 추가 - push를 사용해 고유 키 생성
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
    } catch (err) {
      console.error("Submit Error:", err);
      alert("기록 저장 중 오류가 발생했습니다.");
    }
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
        onGetAiFeedback={handleAiFeedback}
        userDisplayName={user.displayName}
        todayId={todayId}
        onLogout={() => {}}
        onToggleDebug={() => {}}
        isDebug={false}
        debugDate=""
        onDebugDateChange={() => {}}
        onStartRecord={() => {}}
      />
    </main>
  );
}
