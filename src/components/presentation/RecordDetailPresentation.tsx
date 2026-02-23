'use client';

import { RecordItem } from '@/types/note';
import Link from 'next/link';

interface RecordDetailPresentationProps {
  dateId: string;
  records: RecordItem[];
  content: string;
  bookTitle: string;
  type: 'insight' | 'quote';
  category: string;
  tags: string;
  categories: string[];
  onContentChange: (val: string) => void;
  onBookTitleChange: (val: string) => void;
  onTypeChange: (val: 'insight' | 'quote') => void;
  onCategoryChange: (val: string) => void;
  onTagsChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function RecordDetailPresentation({
  dateId,
  records,
  content,
  bookTitle,
  type,
  category,
  tags,
  categories,
  onContentChange,
  onBookTitleChange,
  onTypeChange,
  onCategoryChange,
  onTagsChange,
  onSubmit
}: RecordDetailPresentationProps) {
  const [m, d] = dateId.split('-').slice(1);

  return (
    <main className="container-layout">
      <header className="header-section">
        <Link href="/" style={{textDecoration: 'none'}}>
            <h1 style={{fontSize: '1.5rem', opacity: 0.7}}>🌙 Night Reading</h1>
        </Link>
        <h2 style={{fontSize: '2.2rem', color: 'white', marginTop: '10px'}}>{m}월 {d}일의 밤</h2>
      </header>

      <div className="note-detail-view">
        <Link href="/" style={{display: 'inline-block', marginBottom: '24px', color: '#a0a0a0', textDecoration: 'none'}}>
          ← 목록으로 돌아가기
        </Link>
        
        <form onSubmit={onSubmit} className="card-base" style={{marginBottom: '40px'}}>
          <div style={{display: 'flex', gap: '12px', marginBottom: '24px'}}>
            <button 
              type="button" 
              onClick={() => onTypeChange('insight')} 
              className={`button-primary ${type === 'insight' ? '' : 'inactive'}`}
              style={{flex: 1, backgroundColor: type === 'insight' ? '#6366f1' : '#252525', padding: '10px'}}
            >💡 깨달음</button>
            <button 
              type="button" 
              onClick={() => onTypeChange('quote')} 
              className={`button-primary ${type === 'quote' ? '' : 'inactive'}`}
              style={{flex: 1, backgroundColor: type === 'quote' ? '#6366f1' : '#252525', padding: '10px'}}
            >📖 문장</button>
          </div>

          <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px'}}>
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => onCategoryChange(cat)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: '1px solid #333',
                  background: category === cat ? '#6366f1' : '#1e1e1e',
                  color: category === cat ? 'white' : '#a0a0a0',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <textarea
            style={{width: '100%', background: '#252525', border: '1px solid #333', borderRadius: '12px', padding: '16px', color: 'white', marginBottom: '16px'}}
            placeholder={type === 'insight' ? "무엇을 깨달았나요?" : "어떤 문장이 남았나요?"}
            rows={3}
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
          />
          <input
            style={{width: '100%', background: '#252525', border: '1px solid #333', borderRadius: '12px', padding: '16px', color: 'white', marginBottom: '16px'}}
            placeholder="책 제목 (선택)"
            value={bookTitle}
            onChange={(e) => onBookTitleChange(e.target.value)}
          />
          <input
            style={{width: '100%', background: '#252525', border: '1px solid #333', borderRadius: '12px', padding: '16px', color: 'white', marginBottom: '24px'}}
            placeholder="태그 (쉼표로 구분, 예: 행복, 아침)"
            value={tags}
            onChange={(e) => onTagsChange(e.target.value)}
          />
          <button type="submit" className="button-primary">문장 추가하기</button>
        </form>

        <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
          {records.map((r) => (
            <div key={r.id} className="card-base">
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
                <span className={`badge-label ${r.type}`}>{r.type === 'insight' ? 'INSIGHT' : 'QUOTE'}</span>
                <span style={{fontSize: '0.75rem', color: '#6366f1', fontWeight: 'bold'}}>#{r.category}</span>
              </div>
              <p style={{fontSize: '1.25rem', lineHeight: '1.6', marginBottom: '16px'}}>{r.content}</p>
              <div className="footer">
                {r.bookTitle && <span style={{fontStyle: 'italic', color: '#a0a0a0'}}>— {r.bookTitle}</span>}
                <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px'}}>
                  {r.tags?.map((tag: string) => (
                    <span key={tag} style={{fontSize: '0.75rem', color: '#666', background: '#252525', padding: '2px 8px', borderRadius: '4px'}}>
                      #{tag}
                    </span>
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
