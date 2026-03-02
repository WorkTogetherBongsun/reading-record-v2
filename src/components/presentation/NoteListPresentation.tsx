'use client';

import { Note, RecordItem } from '@/types/note';
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
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: { content: '', imageUrl: '' }
  });

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const val = tagInput.trim().replace(/^#/, '');
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

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div style={{ marginTop: '20px' }}>
      {/* 1. Date Selector: Horizontal buttons */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        overflowX: 'auto', 
        paddingBottom: '16px', 
        marginBottom: '24px',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}>
        {/* 오늘 버튼 고정 */}
        <button
          onClick={() => onDateChange(todayStr)}
          style={{
            padding: '10px 20px',
            borderRadius: '25px',
            border: '1px solid #333',
            background: selectedDate === todayStr ? '#6366f1' : '#161616',
            color: selectedDate === todayStr ? 'white' : '#888',
            whiteSpace: 'nowrap',
            fontSize: '0.9rem',
            cursor: 'pointer',
            fontWeight: selectedDate === todayStr ? '600' : '400',
            transition: 'all 0.2s'
          }}
        >
          오늘
        </button>
        {/* 과거 날짜 버튼들 (기록이 있는 날만) */}
        {notes.filter(n => n.id !== todayStr).map((note) => (
          <button
            key={note.id}
            onClick={() => onDateChange(note.id)}
            style={{
              padding: '10px 20px',
              borderRadius: '25px',
              border: '1px solid #333',
              background: selectedDate === note.id ? '#6366f1' : '#161616',
              color: selectedDate === note.id ? 'white' : '#888',
              whiteSpace: 'nowrap',
              fontSize: '0.9rem',
              cursor: 'pointer',
              fontWeight: selectedDate === note.id ? '600' : '400',
              transition: 'all 0.2s'
            }}
          >
            {note.id.split('-').slice(1).join('. ')}
          </button>
        ))}
      </div>

      {/* 2. Quick Entry Section: Notion/Twitter Hybrid */}
      <div style={{ marginBottom: '64px' }}>
        <form onSubmit={handleSubmit(onSubmit)} className="card-base" style={{ padding: '24px', background: '#161616', border: '1px solid #333' }}>
          <textarea 
            {...register('content', { required: true })}
            placeholder={selectedDate === todayStr ? "오늘의 생각을 한 줄로 남겨보세요..." : `${selectedDate}의 기록에 추가할 내용을 적어보세요...`}
            style={{ width: '100%', background: 'none', border: 'none', color: 'white', fontSize: '1.25rem', outline: 'none', resize: 'none', minHeight: '80px', marginBottom: '10px', lineHeight: '1.6' }}
          />
          
          {previewUrl && (
            <div style={{ marginBottom: '20px', position: 'relative', width: 'fit-content' }}>
              <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '12px', border: '1px solid #333' }} />
              <button type="button" onClick={() => { setPreviewUrl(null); setValue('imageUrl', ''); }} style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}>✕</button>
            </div>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '15px' }}>
            {tags.map((tag, i) => (
              <span key={i} style={{ background: '#6366f1', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem' }}>#{tag}</span>
            ))}
            <input 
              value={tagInput.startsWith('#') ? tagInput : tagInput ? `#${tagInput}` : ''}
              onChange={(e) => setTagInput(e.target.value.replace(/^#/, ''))}
              onKeyDown={handleTagKeyDown}
              placeholder={tags.length === 0 ? "#태그입력 (스페이스)" : "#"}
              style={{ background: 'none', border: 'none', color: '#6366f1', outline: 'none', fontSize: '0.9rem', flex: 1 }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #222', paddingTop: '15px' }}>
            <button type="button" onClick={() => fileInputRef.current?.click()} style={{ background: '#222', border: 'none', borderRadius: '8px', padding: '8px 12px', color: '#888', cursor: 'pointer' }}>📷 이미지 첨부</button>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} accept="image/*" />
            <button type="submit" disabled={isUploading} className="button-primary" style={{ borderRadius: '30px', padding: '10px 24px', fontSize: '0.9rem' }}>
              {isUploading ? '업로드 중...' : '남기기'}
            </button>
          </div>
        </form>
      </div>

      {/* 3. Timeline: Notion-style Inline images/text */}
      <div className="timeline">
        <h3 style={{ fontSize: '0.85rem', color: '#444', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '32px' }}>
          {selectedDate === todayStr ? '오늘의 타임라인' : `${selectedDate}의 타임라인`}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
          {recentRecords.map((record) => (
            <div key={record.id} style={{ display: 'flex', gap: '24px' }}>
              <div style={{ minWidth: '50px', textAlign: 'right', fontSize: '0.8rem', color: '#333', paddingTop: '4px' }}>
                {record.createdAt?.slice(11, 16)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  {record.tags?.map(tag => (
                    <span key={tag} style={{ fontSize: '0.75rem', color: '#6366f1', background: 'rgba(99, 102, 241, 0.05)', padding: '2px 8px', borderRadius: '4px', fontWeight: '500' }}>#{tag}</span>
                  ))}
                </div>
                {record.imageUrl && (
                  <div style={{ marginBottom: '16px' }}>
                    <img src={record.imageUrl} alt="record img" style={{ width: '100%', borderRadius: '16px', border: '1px solid #222' }} />
                  </div>
                )}
                <p style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#ddd', margin: 0, fontWeight: '400' }}>{record.content}</p>
              </div>
            </div>
          ))}
          {recentRecords.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', border: '1px dashed #222', borderRadius: '16px' }}>
              <p style={{ color: '#444', fontSize: '0.9rem' }}>선택한 날짜에 기록된 내용이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
