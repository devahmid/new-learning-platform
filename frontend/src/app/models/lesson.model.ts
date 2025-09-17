export interface Lesson {
    id: number;
    title: string;
    content?: string;
    videoUrl?: string;
    fileUrl?: string;
    order?: number;
    createdAt?: string;
    updatedAt?: string;
    completed?:boolean;
    expanded?: boolean
  }
  