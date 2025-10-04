export interface Lesson {
    id: number;
    title: string;
    content?: string;
    videoUrl?: string;
    fileUrl?: string;
    mindMapUrl?: string;
    flashcards?:any,
    order?: number;
    quiz?:any;
    statusts?: any;
    progress?:any;
   createdAt?: string;
    updatedAt?: string;
    completed?:boolean;
    expanded?: boolean
    icon: string;
    status: 'locked' | 'unlocked' | 'done';
    category: 'vocabulaire' | 'grammaire';
  }
  