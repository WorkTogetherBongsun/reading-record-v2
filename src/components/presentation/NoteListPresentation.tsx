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
      if (val && !tags.includes(val)) setTags([...tags, val]);
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
    } catch (err) { console.error(err); } finally { setIsUploading(false); }
  };

  const onSubmit = (data: any) => {
    onQuickSubmit({ ...data, tags });
    reset();
    setTags([]);
    setPreviewUrl(null);
  };

  return (
    <div style={{ marginTop: '20px' }}>
      {/* Date Selector */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '15px', marginBottom: '20px', borderBottom: '1px solid #222' }}>
        {notes.slice(0, 7).reverse().map((note) => (
          <button
            key={note.id}
            onClick={() => onDateChange(note.id)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: '1px solid #333',
              background: selectedDate === note.id ? '#6366f1' : '#161616',
              color: selectedDate === note.id ? 'white' : '#888',
              whiteSpace: 'nowrap',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            {note.id === new Date().toISOString().split('T')[0] ? '오늘' : note.id.slice(5).replace('-', '.')}
          </button>
        ))}
      </div>

      {/* Quick Entry Section */}
      <div style={{ marginBottom: '60px' }}>
        <form onSubmit={handleSubmit(onSubmit)} className="card-base" style={{ padding: '24px', background: '#161616', border: '1px solid #333' }}>
          <textarea 
            {...register('content', { required: true })}
            placeholder="지금 어떤 생각을 하고 계신가요?"
            style={{ width: '100%', background: 'none', border: 'none', color: 'white', fontSize: '1.2rem', outline: 'none', resize: 'none', minHeight: '80px', marginBottom: '10px' }}
          />
          
          {previewUrl && (
            <div style={{ marginBottom: '20px', position: 'relative' }}>
              <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '12px' }} />
              <button type="button" onClick={() => setPreviewUrl(null)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}>✕</button>
            </div>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '15px' }}>
            {tags.map((tag, i) => (
              <span key={i} style={{ background: '#6366f1', color: 'white', padding: '4px 10px', borderRadius: '15px', fontSize: '0.85rem' }}>#{tag}</span>
            ))}
            <input 
              value={tagInput.startsWith('#') ? tagInput : tagInput ? `#${tagInput}` : ''}
              onChange={(e) => setTagInput(e.target.value.replace(/^#/, ''))}
              onKeyDown={handleTagKeyDown}
              placeholder={tags.length === 0 ? "#태그입력" : "#"}
              style={{ background: 'none', border: 'none', color: '#6366f1', outline: 'none', fontSize: '0.9rem', flex: 1 }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #222', paddingTop: '15px' }}>
            <button type="button" onClick={() => fileInputRef.current?.click()} style={{ background: '#222', border: 'none', borderRadius: '8px', padding: '8px 12px', color: '#888', cursor: 'pointer' }}>📷</button>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} accept="image/*" />
            <button type="submit" disabled={isUploading} className="button-primary" style={{ borderRadius: '30px', padding: '10px 24px' }}>남기기</button>
          </div>
        </form>
      </div>

      <div className="timeline" style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
        {recentRecords.map((record) => (
          <div key={record.id} style={{ display: 'flex', gap: '20px' }}>
            <div style={{ minWidth: '45px', textAlign: 'right', fontSize: '0.8rem', color: '#333' }}>
              {record.createdAt?.slice(11, 16)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                {record.tags?.map(tag => (
                  <span key={tag} style={{ fontSize: '0.75rem', color: '#6366f1' }}>#{tag}</span>
                ))}
              </div>
              {record.imageUrl && <img src={record.imageUrl} alt="img" style={{ width: '100%', borderRadius: '16px', marginBottom: '15px', border: '1px solid #222' }} />}
              <p style={{ fontSize: '1.1rem', lineHeight: '1.7', color: '#ddd', margin: 0 }}>{record.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
