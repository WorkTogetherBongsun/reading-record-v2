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
  todayId: string;
  userDisplayName: string;
  onQuickSubmit: (data: { content: string, tags: string, imageUrl?: string }) => void;
  onLogout: () => void;
  onToggleDebug: () => void;
  isDebug: boolean;
  debugDate: string;
  onDebugDateChange: (date: string) => void;
  onStartRecord: (date?: string) => void;
}

export default function NoteListPresentation({
  recentRecords,
  onQuickSubmit,
  onLogout,
  onToggleDebug,
  userDisplayName,
}: NoteListPresentationProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: { content: '', tags: '', imageUrl: '' }
  });

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
      alert('이미지 업로드 실패');
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = (data: any) => {
    onQuickSubmit(data);
    reset();
    setPreviewUrl(null);
  };

  return (
    <main className="container-layout" style={{ paddingBottom: '120px' }}>
      <div className="nav-bar">
        <div style={{fontWeight: 'bold', fontSize: '1.1rem'}}>Night Reading</div>
        <div className="nav-links">
          <Link href="/" className="active">홈</Link>
          <Link href="/write">책 쓰기</Link>
          <Link href="/books">서재</Link>
        </div>
        <div style={{ cursor: 'pointer', width: '30px', height: '30px', borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>👤</div>
      </div>

      {/* Quick Entry Section: Notion/Twitter Hybrid style */}
      <div style={{ marginTop: '40px', marginBottom: '60px' }}>
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

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #222', paddingTop: '15px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', width: '70%' }}>
              <button type="button" onClick={() => fileInputRef.current?.click()} style={{ background: '#222', border: 'none', borderRadius: '8px', padding: '8px 12px', color: '#888', cursor: 'pointer' }}>📷</button>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} accept="image/*" />
              <input 
                {...register('tags')}
                placeholder="#태그입력"
                style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '0.9rem', outline: 'none', width: '100%' }}
              />
            </div>
            <button type="submit" disabled={isUploading} className="button-primary" style={{ padding: '10px 24px', borderRadius: '30px', fontSize: '0.9rem' }}>
              {isUploading ? '업로드 중...' : '남기기'}
            </button>
          </div>
        </form>
      </div>

      <div className="timeline">
        <h3 style={{ fontSize: '0.85rem', color: '#444', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '30px' }}>최근 타임라인</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          {recentRecords.map((record) => (
            <div key={record.id} style={{ display: 'flex', gap: '20px' }}>
              <div style={{ minWidth: '45px', textAlign: 'right' }}>
                <span style={{ fontSize: '0.8rem', color: '#333', fontWeight: '600' }}>{record.createdAt?.slice(5, 10).replace('-', '.')}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                  {record.tags?.map(tag => (
                    <span key={tag} style={{ fontSize: '0.75rem', color: '#6366f1', background: 'rgba(99, 102, 241, 0.05)', padding: '2px 8px', borderRadius: '4px' }}>#{tag}</span>
                  ))}
                </div>
                {record.imageUrl && (
                  <img src={record.imageUrl} alt="Record" style={{ width: '100%', borderRadius: '16px', marginBottom: '15px', border: '1px solid #222' }} />
                )}
                <p style={{ fontSize: '1.2rem', lineHeight: '1.7', color: '#ddd', margin: 0 }}>{record.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', zIndex: 100 }}>
        <Link href="/write" style={{ textDecoration: 'none' }}>
          <button className="button-primary" style={{ padding: '14px 32px', borderRadius: '40px', background: '#1e1e1e', border: '1px solid #4f46e5', color: '#4f46e5', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            ✍️ 책으로 엮기
          </button>
        </Link>
      </div>
    </main>
  );
}
