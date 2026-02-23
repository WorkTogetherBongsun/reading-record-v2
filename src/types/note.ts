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
