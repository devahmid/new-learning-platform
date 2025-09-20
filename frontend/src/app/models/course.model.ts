// export interface Course {
//     id: number;
//     title: string;
//     description: string;
//     category?: { name: string };
//     level: { name: string };
//     instructor: { pseudo: string };
//     videoUrl?: string;
//     pdfUrl?: string;
//     createdAt: Date;
//     updatedAt: Date;

import { Category } from "./category.model";
import { Classe } from "./classe.model";
import { Enrollment } from "./enrollment.model";
import { Lesson } from "./lesson.model";
import { Quiz } from "./quiz.model";
import { User } from "./user.model";

//   }
export interface Course {
  id: number;
  title: string;
  description: string;
  videoUrl?: string;
  pdfUrl?: string;
  instructor: User;
  category?: Category;
  classe?: Classe;  // ✅ Optionnel pour rétrocompatibilité
  enrollments: Enrollment[];
  quizzes: Quiz[];
  lessons: Lesson[];
  createdAt: string;
  updatedAt: string;
  classes?: Classe[];  // ✅ Nouveau format : array de classes
}
