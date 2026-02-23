'use client';

import RecordDetailContainer from '@/components/container/RecordDetailContainer';

export default function RecordDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <RecordDetailContainer params={params} />;
}
