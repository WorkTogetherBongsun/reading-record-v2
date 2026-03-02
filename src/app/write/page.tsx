'use client';

import BookWriteContainer from '@/components/container/BookWriteContainer';
import GlobalHeader from '@/components/common/GlobalHeader';

export default function BookWritePage() {
  return (
    <main className="container-layout">
      <GlobalHeader />
      <div style={{ marginTop: '40px' }}>
        <BookWriteContainer />
      </div>
    </main>
  );
}
