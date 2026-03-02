'use client';

import { Note, RecordItem } from '@/types/note';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { storage } from '@/lib/firebase';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

interface NoteListPresentationProps {
  notes: Note[];
  recentRecords: RecordItem[];
  todayId: string;
  userDisplayName: string;
  onQuickSubmit: (data: { content: string, tags: string[], imageUrl?: string }) => void;
  onLogout: () => void;
}

export default function NoteListPresentation({
  recentRecords,
  onQuickSubmit,
}: NoteListPresentationProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [searchTag, setSearchTag] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: { content: '', imageUrl: '' }
  });

  // 태그 처리 로직
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

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
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
    } finally { setIsUploading(false); }
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

  return (
    <main className="container-layout" style={{ paddingBottom: '120px' }}>
      <div className="nav-bar">
        <div style={{fontWeight: 'bold', fontSize: '1.1rem'}}>Night Reading</div>
        <div className="nav-links">
          <Link href="/" className="active">홈</Link>
          <Link href="/write">책 쓰기</Link>
          <Link href="/books">서재</Link>
        </div>
      </div>

      {/* Quick Entry Section */}
      <div style={{ marginTop: '40px', marginBottom: '60px' }}>
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
              <span key={i} style={{ background: '#6366f1', color: 'white', padding: '4px 10px', borderRadius: '15px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                #{tag} <span onClick={() => removeTag(i)} style={{ cursor: 'pointer', fontSize: '10px', opacity: 0.7 }}>✕</span>
              </span>
            ))}
            <input 
              value={tagInput.startsWith('#') ? tagInput : tagInput ? `#${tagInput}` : ''}
              onChange={(e) => setTagInput(e.target.value.replace(/^#/, ''))}
              onKeyDown={handleTagKeyDown}
              placeholder={tags.length === 0 ? "#태그입력 (스페이스/엔터)" : "#"}
              style={{ background: 'none', border: 'none', color: '#6366f1', outline: 'none', fontSize: '0.9rem', flex: 1, minWidth: '100px' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #222', paddingTop: '15px' }}>
            <button type="button" onClick={() => fileInputRef.current?.click()} style={{ background: '#222', border: 'none', borderRadius: '8px', padding: '8px 12px', color: '#888', cursor: 'pointer' }}>📷</button>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} accept="image/*" />
            <button type="submit" disabled={isUploading} className="button-primary" style={{ borderRadius: '30px', padding: '10px 24px' }}>남기기</button>
          </div>
        </form>
      </div>

      {/* Search Filter */}
      <div style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <h3 style={{ fontSize: '0.85rem', color: '#444', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>타임라인</h3>
        {searchTag && (
          <span style={{ fontSize: '0.8rem', color: '#6366f1', background: 'rgba(99,102,241,0.1)', padding: '4px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            #{searchTag} 결과 <span onClick={() => setSearchTag(null)} style={{ cursor: 'pointer' }}>✕</span>
          </span>
        )}
      </div>

      <div className="timeline" style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
        {filteredRecords.map((record) => (
          <div key={record.id} style={{ display: 'flex', gap: '20px' }}>
            <div style={{ minWidth: '45px', textAlign: 'right', fontSize: '0.8rem', color: '#333' }}>
              {record.createdAt?.slice(5, 10).replace('-', '.')}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                {record.tags?.map(tag => (
                  <span key={tag} onClick={() => setSearchTag(tag)} style={{ cursor: 'pointer', fontSize: '0.75rem', color: '#6366f1', background: 'rgba(99,102,241,0.05)', padding: '2px 8px', borderRadius: '4px' }}>#{tag}</span>
                ))}
              </div>
              {record.imageUrl && <img src={record.imageUrl} alt="img" style={{ width: '100%', borderRadius: '16px', marginBottom: '15px', border: '1px solid #222' }} />}
              <p style={{ fontSize: '1.2rem', lineHeight: '1.7', color: '#ddd', margin: 0 }}>{record.content}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
