'use client';

import { Note, RecordItem } from '@/types/note';
import Link from 'next/link';
import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { storage } from '@/lib/firebase';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

interface NoteListPresentationProps {
  notes: Note[];
  recentRecords: RecordItem[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  onQuickSubmit: (data: { content: string, tags: string[], imageUrl?: string }) => void;
  userDisplayName: string;
}

export default function NoteListPresentation({
  notes,
  recentRecords,
  selectedDate,
  onDateChange,
  onQuickSubmit,
}: NoteListPresentationProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isComposing, setIsComposing] = useState(false); // 한글 조합 상태
  const [searchTag, setSearchTag] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: { content: '', imageUrl: '' }
  });

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    // 한글 조합 중이면 로직 실행 방지
    if (isComposing) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const val = tagInput.trim();
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
      }
      setTagInput('');
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const path = `quick-images/${Date.now()}_${file.name}`;
      const r = storageRef(storage, path);
      await uploadBytes(r, file);
      const url = await getDownloadURL(r);
      setValue('imageUrl', url);
      setPreviewUrl(url);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = (data: any) => {
    onQuickSubmit({ ...data, tags });
    reset();
    setTags([]);
    setPreviewUrl(null);
  };

  const filteredRecords = searchTag 
    ? recentRecords.filter(r => r.tags?.includes(searchTag))
    : recentRecords;

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div style={{ marginTop: '20px' }}>
      {/* Date Selector */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '16px', marginBottom: '24px', scrollbarWidth: 'none' }}>
        <button
          onClick={() => onDateChange(todayStr)}
          style={{
            padding: '10px 20px', borderRadius: '25px', border: '1px solid #333',
            background: selectedDate === todayStr ? '#6366f1' : '#161616',
            color: selectedDate === todayStr ? 'white' : '#888',
            whiteSpace: 'nowrap', fontSize: '0.9rem', cursor: 'pointer', fontWeight: selectedDate === todayStr ? '600' : '400'
          }}
        >오늘</button>
        {notes.filter(n => n.id !== todayStr).map((note) => (
          <button
            key={note.id}
            onClick={() => onDateChange(note.id)}
            style={{
              padding: '10px 20px', borderRadius: '25px', border: '1px solid #333',
              background: selectedDate === note.id ? '#6366f1' : '#161616',
              color: selectedDate === note.id ? 'white' : '#888',
              whiteSpace: 'nowrap', fontSize: '0.9rem', cursor: 'pointer', fontWeight: selectedDate === note.id ? '600' : '400'
            }}
          >{note.id.split('-').slice(1).join('. ')}</button>
        ))}
      </div>

      {/* Quick Entry Section */}
      <div style={{ marginBottom: '64px' }}>
        <form onSubmit={handleSubmit(onSubmit)} className="card-base" style={{ padding: '24px', background: '#161616', border: '1px solid #333' }}>
          <textarea 
            {...register('content', { required: true })}
            placeholder="지금 어떤 생각을 하고 계신가요?"
            style={{ width: '100%', background: 'none', border: 'none', color: 'white', fontSize: '1.25rem', outline: 'none', resize: 'none', minHeight: '80px', marginBottom: '10px', lineHeight: '1.6' }}
          />
          
          {previewUrl && (
            <div style={{ marginBottom: '20px', position: 'relative', width: 'fit-content' }}>
              <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '12px', border: '1px solid #333' }} />
              <button type="button" onClick={() => { setPreviewUrl(null); setValue('imageUrl', ''); }} style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}>✕</button>
            </div>
          )}

          {/* 태그 입력 영역 (개선됨) */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '15px', alignItems: 'center' }}>
            {tags.map((tag, i) => (
              <span key={i} style={{ background: '#6366f1', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem' }}>#{tag}</span>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', color: '#6366f1', fontSize: '0.9rem' }}>
              <span style={{ marginRight: '2px' }}>#</span>
              <input 
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onCompositionStart={() => setIsComposing(true)}
                onCompositionEnd={() => setIsComposing(false)}
                placeholder="태그입력"
                style={{ background: 'none', border: 'none', color: '#6366f1', outline: 'none', fontSize: '0.9rem', width: '100px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #222', paddingTop: '15px' }}>
            <button type="button" onClick={() => fileInputRef.current?.click()} style={{ background: '#222', border: 'none', borderRadius: '8px', padding: '8px 12px', color: '#888', cursor: 'pointer' }}>📷 이미지</button>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} accept="image/*" />
            <button type="submit" disabled={isUploading} className="button-primary" style={{ borderRadius: '30px', padding: '10px 24px', fontSize: '0.9rem' }}>
              {isUploading ? '업로드 중...' : '남기기'}
            </button>
          </div>
        </form>
      </div>

      {/* Timeline Filter UI */}
      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '0.85rem', color: '#444', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>
          {selectedDate === todayStr ? '오늘의 타임라인' : `${selectedDate}의 타임라인`}
        </h3>
        {searchTag && (
          <div 
            onClick={() => setSearchTag(null)}
            style={{ fontSize: '0.8rem', color: '#6366f1', cursor: 'pointer', background: 'rgba(99, 102, 241, 0.1)', padding: '4px 12px', borderRadius: '20px' }}
          >
            #{searchTag} 필터 해제 ✕
          </div>
        )}
      </div>

      <div className="timeline" style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
        {filteredRecords.map((record) => (
          <div key={record.id} style={{ display: 'flex', gap: '24px' }}>
            <div style={{ minWidth: '50px', textAlign: 'right', fontSize: '0.8rem', color: '#333', paddingTop: '4px' }}>
              {record.createdAt?.slice(11, 16)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                {record.tags?.map(tag => (
                  <span 
                    key={tag} 
                    onClick={() => setSearchTag(tag)}
                    style={{ fontSize: '0.75rem', color: '#6366f1', background: 'rgba(99, 102, 241, 0.05)', padding: '2px 8px', borderRadius: '4px', fontWeight: '500', cursor: 'pointer' }}
                  >#{tag}</span>
                ))}
              </div>
              {record.imageUrl && (
                <div style={{ marginBottom: '16px' }}>
                  <img src={record.imageUrl} alt="record img" style={{ width: '100%', borderRadius: '16px', border: '1px solid #222' }} />
                </div>
              )}
              <p style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#ddd', margin: 0 }}>{record.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
