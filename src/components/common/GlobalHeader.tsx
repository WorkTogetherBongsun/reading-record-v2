'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function GlobalHeader() {
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
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
  );
}
