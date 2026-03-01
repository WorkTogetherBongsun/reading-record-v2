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
import { polishText } from '@/lib/gemini'; // Gemini 유틸 추가

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
    try {
      const polished = await polishText(text); // 진짜 Gemini 호출
      return polished;
    } catch (err) {
      console.error('AI Polish Error:', err);
      alert('AI 다듬기 중 오류가 발생했습니다. API 키 설정을 확인해주세요.');
      return text;
    } finally {
      setIsAiPolishing(false);
    }
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
