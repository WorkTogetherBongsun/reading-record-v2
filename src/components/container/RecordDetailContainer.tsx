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
import RecordDetailPresentation from '../../components/presentation/RecordDetailPresentation';

export default function RecordDetailContainer({ params }: { params: Promise<{ id: string }> }) {
  const { id: dateId } = use(params);
  const [user] = useState<any>({ uid: 'default_user', displayName: '기록자' }); 
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [content, setContent] = useState('');
  const [bookTitle, setBookTitle] = useState('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content || !user) return;
    try {
      const recordsRef = ref(db, `notes/${user.uid}_${dateId}/records`);
      const newRecordRef = push(recordsRef);
      await set(newRecordRef, {
        content,
        bookTitle,
        type,
        category,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
        createdAt: new Date().toISOString(),
        userId: user.uid
      });
      setContent('');
      setBookTitle('');
      setTags('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <RecordDetailPresentation 
      dateId={dateId}
      records={records}
      content={content}
      bookTitle={bookTitle}
      type={type}
      category={category}
      tags={tags}
      categories={categories}
      onContentChange={setContent}
      onBookTitleChange={setBookTitle}
      onTypeChange={setType}
      onCategoryChange={setCategory}
      onTagsChange={setTags}
      onSubmit={handleSubmit}
    />
  );
}
