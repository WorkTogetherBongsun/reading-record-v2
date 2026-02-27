'use client';

import { useState, useEffect, use } from 'react';
import { db, storage } from '@/lib/firebase';
import { 
  ref as dbRef, 
  onValue, 
  push, 
  set
} from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { RecordItem } from '@/types/note';
import RecordDetailPresentation, { RecordFormData } from '../../components/presentation/RecordDetailPresentation';

export default function RecordDetailContainer({ params }: { params: Promise<{ id: string }> }) {
  const { id: dateId } = use(params);
  const [user] = useState<any>({ uid: 'default_user', displayName: '기록자' }); 
  const [records, setRecords] = useState<RecordItem[]>([]);
  
  const [type, setType] = useState<'insight' | 'quote'>('insight');
  const [category, setCategory] = useState('생각');
  const [tags, setTags] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isAiPolishing, setIsAiPolishing] = useState(false);

  const categories = ['생각', '철학', '성장', '기술', '문장', '기타'];

  useEffect(() => {
    if (!user) return;
    const recordsPath = dbRef(db, `notes/${user.uid}_${dateId}/records`);
    const unsubscribe = onValue(recordsPath, (snapshot) => {
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

  const handleImageUpload = async (file: File): Promise<string> => {
    setIsUploading(true);
    try {
      const imagePath = `images/${user.uid}/${Date.now()}_${file.name}`;
      const fileRef = storageRef(storage, imagePath);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      return url;
    } catch (err) {
      console.error('Upload Error:', err);
      return '';
    } finally {
      setIsUploading(false);
    }
  };

  const handleAiPolish = async (text: string): Promise<string> => {
    setIsAiPolishing(true);
    // AI 시뮬레이션: 실제로는 서버 API 호출 가능
    return new Promise((resolve) => {
      setTimeout(() => {
        const polished = `[AI로 풍성해진 문장] ${text} - 이 찰나의 깨달음은 마치 밤하늘에 수놓인 별빛처럼 나의 내면을 은은하게 밝혀줍니다. 정해진 틀을 벗어나 마주하는 이 새로운 공기는 나의 세계를 더 넓은 곳으로 인도하는 초대장이 아닐까요.`;
        resolve(polished);
        setIsAiPolishing(false);
      }, 1200);
    });
  };

  const handleSubmit = async (data: RecordFormData) => {
    if (!user) return;
    try {
      const recordsPath = dbRef(db, `notes/${user.uid}_${dateId}/records`);
      const newRecordRef = push(recordsPath);
      await set(newRecordRef, {
        content: data.content,
        bookTitle: data.bookTitle,
        type: data.type,
        category: data.category,
        tags: data.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
        imageUrl: data.imageUrl || '',
        createdAt: new Date().toISOString(),
        userId: user.uid
      });
      setTags('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <RecordDetailPresentation 
      dateId={dateId}
      records={records}
      type={type}
      category={category}
      tags={tags}
      categories={categories}
      isUploading={isUploading}
      isAiPolishing={isAiPolishing}
      onTypeChange={setType}
      onCategoryChange={setCategory}
      onTagsChange={setTags}
      onAiPolish={handleAiPolish}
      onImageUpload={handleImageUpload}
      onSubmit={handleSubmit}
    />
  );
}
