export interface Lesson {
    id: number;
    title: string;
    content?: string;
    videoUrl?: string;
    fileUrl?: string;
    mindMapUrl?: string;
    order?: number;
    createdAt?: string;
    updatedAt?: string;
    completed?: boolean;
    expanded?: boolean;
    subcategoryId?: number;
    subcategory?: {
      id: number;
      name: string;
      description?: string;
    };
  }
  