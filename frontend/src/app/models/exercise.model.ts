export interface Exercise {
  id: number;
  title: string;
  description?: string;
  type:
    | 'flashcard'
    | 'translation'
    | 'listening'
    | 'multiple_choice'
    | 'fill_blank';
  order: number;
  isActive: boolean;
  lessonId: number;
  questions: ExerciseQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface ExerciseQuestion {
  id: number;
  text: string;
  audioUrl?: string;
  imageUrl?: string;
  order: number;
  metadata?: {
    pronunciation?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    hints?: string[];
  };
  exerciseId: number;
  answers: ExerciseAnswer[];
  createdAt: string;
  updatedAt: string;
}

export interface ExerciseAnswer {
  id: number;
  text: string;
  isCorrect: boolean;
  order: number;
  metadata?: {
    pronunciation?: string;
    explanation?: string;
  };
  questionId: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExerciseProgress {
  exerciseId: number;
  questionId: number;
  answerId?: number;
  isCorrect: boolean;
  timeSpent: number;
  attempts: number;
}

export interface ExerciseResult {
  exerciseId: number;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  completedAt: Date;
}
