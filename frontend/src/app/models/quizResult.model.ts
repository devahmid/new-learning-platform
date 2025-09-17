import { Enrollment } from "./enrollment.model";
import { Quiz } from "./quiz.model";

export interface QuizResult {
    id: number;
    enrollment: Enrollment;
    quiz: Quiz;
    score: number;
    createdAt: string;
  }
  