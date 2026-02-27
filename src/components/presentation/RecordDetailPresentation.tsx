'use client';

import { RecordItem } from '@/types/note';
import Link from 'next/link';
import { useModal } from '@/components/modal/context/ModalContext';
import TagInputModal from './TagInputModal';
import { useForm } from 'react-hook-form';
import { useEffect, useState, useRef } from 'react';

interface RecordDetailPresentationProps {
  dateId: string;
  records: RecordItem[];
  type: 'insight' | 'quote';
  category: string;
  tags: string;
  categories: string[];
  isUploading: boolean;
  isAiPolishing: boolean;
  onTypeChange: (val: 'insight' | 'quote') => void;
  onCategoryChange: (val: string) => void;
  onTagsChange: (val: string) => void;
  onAiPolish: (text: string) => Promise<string>;
  onImageUpload: (file: File) => Promise<string>;
  onSubmit: (data: RecordFormData) => void;
}

export interface RecordFormData {
  content: string;
  bookTitle: string;
  type: 'insight' | 'quote';
  category: string;
  tags: string;
  imageUrl?: string;
}

export default function RecordDetailPresentation({
  dateId,
  records,
  type,
  category,
  tags,
  categories,
  isUploading,
  isAiPolishing,
  onTypeChange,
  onCategoryChange,
  onTagsChange,
  onAiPolish,
  onImageUpload,
  onSubmit
}: RecordDetailPresentationProps) {
  const [m, d] = dateId.split('-').slice(1);
  const { openModal } = useModal();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, watch } = useForm<RecordFormData>({
    defaultValues: {
      content: '',
      bookTitle: '',
      type: type,
      category: category,
      tags: tags,
      imageUrl: ''
    }
  });

  const contentValue = watch('content');

  useEffect(() => { setValue('type', type); }, [type, setValue]);
  useEffect(() => { setValue('category', category); }, [category, setValue]);
  useEffect(() => { setValue('tags', tags); }, [tags, setValue]);

  const onInternalSubmit = (data: RecordFormData) => {
    onSubmit(data);
    reset({
      content: '',
      bookTitle: '',
      type: type,
      category: category,
      tags: '',
      imageUrl: ''
    });
    setPreviewUrl(null);
    onTagsChange('');
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await onImageUpload(file);
      setValue('imageUrl', url);
      setPreviewUrl(url);
    }
  };

  const handleAiPolishClick = async () => {
    if (!contentValue) return;
    const polishedText = await onAiPolish(contentValue);
    setValue('content', polishedText);
  };

  const handleOpenTagModal = () => {
    openModal({
      key: 'tag-input',
      Component: TagInputModal,
      props: {
        initialTags: tags,
        onConfirm: (newTags: string) => {
          onTagsChange(newTags);
          setValue('tags', newTags);
        },
      }
    });
  };

  return (
    <main className="container-layout">
      <header className="header-section">
        <Link href="/" style={{textDecoration: 'none'}}>
            <h1 style={{fontSize: '1.5rem', opacity: 0.7}}>🌙 Night Reading</h1>
        </Link>
        <h2 style={{fontSize: '2.2rem', color: 'white', marginTop: '10px'}}>{m}월 {d}일의 밤</h2>
      </header>

      <div className="note-detail-view">
        <Link href="/" className="back-btn" style={{display: 'inline-block', marginBottom: '24px', color: '#a0a0a0', textDecoration: 'none'}}>
          ← 목록으로 돌아가기
        </Link>
        
        <form onSubmit={handleSubmit(onInternalSubmit)} className="card-base" style={{marginBottom: '40px', position: 'relative'}}>
          <div style={{display: 'flex', gap: '12px', marginBottom: '24px'}}>
            <button type="button" onClick={() => onTypeChange('insight')} className={`button-primary ${type === 'insight' ? '' : 'inactive'}`} style={{flex: 1, backgroundColor: type === 'insight' ? '#6366f1' : '#252525', padding: '10px'}}>💡 깨달음</button>
            <button type="button" onClick={() => onTypeChange('quote')} className={`button-primary ${type === 'quote' ? '' : 'inactive'}`} style={{flex: 1, backgroundColor: type === 'quote' ? '#6366f1' : '#252525', padding: '10px'}}>📖 문장</button>
          </div>

          <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px'}}>
            {categories.map(cat => (
              <button key={cat} type="button" onClick={() => onCategoryChange(cat)} style={{ padding: '6px 12px', borderRadius: '20px', border: '1px solid #333', background: category === cat ? '#6366f1' : '#1e1e1e', color: category === cat ? 'white' : '#a0a0a0', fontSize: '0.85rem', cursor: 'pointer' }}>{cat}</button>
            ))}
          </div>

          <div style={{position: 'relative'}}>
            <textarea
              {...register('content', { required: true })}
              style={{width: '100%', background: '#252525', border: '1px solid #333', borderRadius: '12px', padding: '16px', paddingRight: '100px', color: 'white', marginBottom: '16px', minHeight: '120px'}}
              placeholder={type === 'insight' ? "무엇을 깨달았나요?" : "어떤 문장이 남았나요?"}
            />
            <button 
              type="button"
              onClick={handleAiPolishClick}
              disabled={isAiPolishing || !contentValue}
              style={{position: 'absolute', right: '12px', top: '12px', background: '#4f46e5', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', cursor: 'pointer', opacity: isAiPolishing ? 0.5 : 1}}
            >
              {isAiPolishing ? '다듬는 중...' : '✨ AI 다듬기'}
            </button>
          </div>

          <div style={{display: 'flex', gap: '12px', marginBottom: '16px'}}>
            <input
              {...register('bookTitle')}
              style={{flex: 1, background: '#252525', border: '1px solid #333', borderRadius: '12px', padding: '16px', color: 'white'}}
              placeholder="책 제목 (선택)"
            />
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{background: '#1e1e1e', border: '1px solid #333', color: '#a0a0a0', borderRadius: '12px', padding: '0 20px', cursor: 'pointer'}}
            >
              📷 이미지
            </button>
            <input type="file" ref={fileInputRef} onChange={handleImageChange} style={{display: 'none'}} accept="image/*" />
          </div>
          
          {previewUrl && (
            <div style={{marginBottom: '16px', position: 'relative', width: '100px', height: '100px'}}>
              <img src={previewUrl} alt="Preview" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px'}} />
              <button type="button" onClick={() => { setPreviewUrl(null); setValue('imageUrl', ''); }} style={{position: 'absolute', top: '-8px', right: '-8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px'}}>✕</button>
            </div>
          )}

          <div onClick={handleOpenTagModal} style={{ width: '100%', background: '#252525', border: '1px solid #333', borderRadius: '12px', padding: '16px', color: tags ? 'white' : '#666', marginBottom: '24px', cursor: 'pointer', fontSize: '0.9rem' }}>
            {tags ? `태그: ${tags}` : '태그 입력하기 (클릭)'}
          </div>
          
          <button type="submit" className="button-primary" disabled={isUploading}>
            {isUploading ? '이미지 업로드 중...' : '문장 추가하기'}
          </button>
        </form>

        <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
          {records.map((r) => (
            <div key={r.id} className="card-base">
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
                <span className={`badge-label ${r.type}`}>{r.type === 'insight' ? 'INSIGHT' : 'QUOTE'}</span>
                <span style={{fontSize: '0.75rem', color: '#6366f1', fontWeight: 'bold'}}>#{r.category}</span>
              </div>
              {r.imageUrl && (
                <img src={r.imageUrl} alt="Record" style={{width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '12px', marginBottom: '16px'}} />
              )}
              <p style={{fontSize: '1.25rem', lineHeight: '1.6', marginBottom: '16px'}}>{r.content}</p>
              <div className="footer">
                {r.bookTitle && <span style={{fontStyle: 'italic', color: '#a0a0a0'}}>— {r.bookTitle}</span>}
                <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px'}}>
                  {r.tags?.map((tag: string) => (
                    <span key={tag} style={{fontSize: '0.75rem', color: '#666', background: '#252525', padding: '2px 8px', borderRadius: '4px'}}>#{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
