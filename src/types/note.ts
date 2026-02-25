export interface Note {
  id: string;
  title: string;
  createdAt: any;
  userId: string;
}

export interface RecordItem {
  id: string;
  content: string;
  bookTitle?: string;
  type: 'insight' | 'quote';
  category: string;
  tags: string[];
  createdAt: any;
  userId: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  content: string[]; // 묶인 문장들의 리스트
  highlights: Record<string, boolean>; // 뷰어에서 하이라이트한 문장 인덱스
  createdAt: any;
  userId: string;
}
