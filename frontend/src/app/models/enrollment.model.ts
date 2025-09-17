import { Course } from "./course.model";
import { QuizResult } from "./quizResult.model";
import { User } from "./user.model";

export interface Enrollment {
    id: number;
    student: User;
    course: Course;
    progress: number;
    quizResults: QuizResult[];
    createdAt: string;
    updatedAt: string;
  }
  