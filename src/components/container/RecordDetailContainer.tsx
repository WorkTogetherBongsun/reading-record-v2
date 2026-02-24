'use client';

import { useState, useEffect, use } from 'react';
import { db } from '@/lib/firebase';
import { 
  ref, 
  onValue, 
  push, 
  set
} from 'firebase/database';
import { RecordItem } from '@/types/note';
import RecordDetailPresentation, { RecordFormData } from '../../components/presentation/RecordDetailPresentation';

export default function RecordDetailContainer({ params }: { params: Promise<{ id: string }> }) {
  const { id: dateId } = use(params);
  const [user] = useState<any>({ uid: 'default_user', displayName: '기록자' }); 
  const [records, setRecords] = useState<RecordItem[]>([]);
  
  // Presentation의 UI 상태 관리를 위한 state들 (form 외부 요소들)
  const [type, setType] = useState<'insight' | 'quote'>('insight');
  const [category, setCategory] = useState('생각');
  const [tags, setTags] = useState('');

  const categories = ['생각', '철학', '성장', '기술', '문장', '기타'];

  useEffect(() => {
    if (!user) return;
    const recordsRef = ref(db, `notes/${user.uid}_${dateId}/records`);
    const unsubscribe = onValue(recordsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const recordsList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setRecords(recordsList);
      } else {
        setRecords([]);
      }
    });
    return () => unsubscribe();
  }, [user, dateId]);

  const handleSubmit = async (data: RecordFormData) => {
    if (!user) return;
    try {
      const recordsRef = ref(db, `notes/${user.uid}_${dateId}/records`);
      const newRecordRef = push(recordsRef);
      await set(newRecordRef, {
        content: data.content,
        bookTitle: data.bookTitle,
        type: data.type,
        category: data.category,
        tags: data.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
        createdAt: new Date().toISOString(),
        userId: user.uid
      });
      
      // 제출 후 태그 상태 초기화 (Presentation 내부에서 reset 처리됨)
      setTags('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <RecordDetailPresentation 
      dateId={dateId}
      records={records}
      content="" // react-hook-form에서 관리하므로 빈 값
      bookTitle="" // react-hook-form에서 관리하므로 빈 값
      type={type}
      category={category}
      tags={tags}
      categories={categories}
      onContentChange={() => {}} // react-hook-form 내부 처리
      onBookTitleChange={() => {}} // react-hook-form 내부 처리
      onTypeChange={setType}
      onCategoryChange={setCategory}
      onTagsChange={setTags}
      onSubmit={handleSubmit}
    />
  );
}
