import { Course } from '../course.entity';

export class CourseResponseDto {
  id: number;
  title: string;
  description: string;
  videoUrl: string;
  pdfUrl: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  category: any;
  subcategory: any;
  level: any;
  instructor: any;
  lessons: any[];
  enrollments: any[];
  quizzes: any[];
  
  // Propriétés calculées
  totalLessons: number;
  totalQuizzes: number;
  totalQuestions: number;
  estimatedDuration: number;
  subject: string;
  subjectInfo: any;
}

export class CourseWithCompleteInfoDto extends CourseResponseDto {
  // Hérite de toutes les propriétés de CourseResponseDto
  // et peut ajouter des propriétés spécifiques si nécessaire
}
