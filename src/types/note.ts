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
  imageUrl?: string; // 이미지 URL 추가
  createdAt: any;
  userId: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  content: string[]; 
  images?: string[]; // 책에 포함된 이미지들
  highlights: Record<string, boolean>; 
  createdAt: any;
  userId: string;
}
