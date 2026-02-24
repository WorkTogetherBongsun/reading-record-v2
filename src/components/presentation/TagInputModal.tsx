'use client';

import React from 'react';

interface TagInputModalProps {
  initialTags: string;
  onConfirm: (tags: string) => void;
  onClose: () => void;
}

export default function TagInputModal({ initialTags, onConfirm, onClose }: TagInputModalProps) {
  const [tags, setTags] = React.useState(initialTags);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(tags);
    onClose();
  };

  return (
    <div className="tag-input-modal">
      <h3 style={{ color: 'white', marginBottom: '16px', fontSize: '1.25rem' }}>태그 편집</h3>
      <p style={{ color: '#a0a0a0', fontSize: '0.9rem', marginBottom: '20px' }}>
        기록을 분류할 태그를 입력해주세요. (쉼표로 구분)
      </p>
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="예: 행복, 독서, 아침"
          autoFocus
          style={{
            width: '100%',
            background: '#252525',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '16px',
            color: 'white',
            marginBottom: '24px',
            outline: 'none'
          }}
        />
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            onClick={onClose}
            className="button-primary"
            style={{ flex: 1, backgroundColor: '#333', color: '#a0a0a0' }}
          >
            취소
          </button>
          <button
            type="submit"
            className="button-primary"
            style={{ flex: 2 }}
          >
            저장하기
          </button>
        </div>
      </form>
    </div>
  );
}
