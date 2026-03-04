'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function GlobalHeader() {
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [geminiKey, setGeminiKey] = useState('');

  useEffect(() => {
    // 로컬 스토리지에서 키 불러오기
    const savedKey = localStorage.getItem('gemini_api_key') || '';
    setGeminiKey(savedKey);
  }, []);

  const handleSaveKey = () => {
    localStorage.setItem('gemini_api_key', geminiKey);
    alert('Gemini API Key가 저장되었습니다! 🐶');
    setIsProfileOpen(false);
    window.location.reload(); // 키 적용을 위해 새로고침
  };

  return (
    <>
      <nav className="nav-bar">
        <div style={{ fontWeight: 'bold', fontSize: '1.1rem', letterSpacing: '-0.5px' }}>Night Reading</div>
        <div className="nav-links">
          <Link href="/" className={pathname === '/' ? 'active' : ''}>홈</Link>
          <Link href="/write" className={pathname === '/write' ? 'active' : ''}>책 쓰기</Link>
          <Link href="/books" className={pathname === '/books' ? 'active' : ''}>서재</Link>
        </div>
        <div 
          onClick={() => setIsProfileOpen(!isProfileOpen)} 
          style={{ cursor: 'pointer', width: '30px', height: '30px', borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}
        >
          👤
        </div>
      </nav>

      {/* Profile Settings Modal/Overlay */}
      {isProfileOpen && (
        <div style={{
          position: 'fixed',
          top: '70px',
          right: '24px',
          width: '280px',
          background: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '16px',
          padding: '20px',
          zIndex: 1000,
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
        }}>
          <h4 style={{ margin: '0 0 15px 0', fontSize: '0.9rem', color: '#eee' }}>AI 설정</h4>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontSize: '0.75rem', color: '#888', display: 'block', marginBottom: '8px' }}>Gemini API Key</label>
            <input 
              type="password" 
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="API 키를 입력하세요"
              style={{
                width: '100%',
                background: '#0f0f0f',
                border: '1px solid #333',
                borderRadius: '8px',
                padding: '10px',
                color: 'white',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          </div>
          <button 
            onClick={handleSaveKey}
            className="button-primary"
            style={{ width: '100%', padding: '10px', fontSize: '0.85rem', borderRadius: '8px' }}
          >
            저장하기
          </button>
          <p style={{ fontSize: '0.7rem', color: '#555', marginTop: '10px', lineHeight: '1.4' }}>
            * 입력하신 키는 브라우저에만 안전하게 저장됩니다.
          </p>
        </div>
      )}
    </>
  );
}
