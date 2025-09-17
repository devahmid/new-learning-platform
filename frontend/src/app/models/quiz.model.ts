import { Course } from "./course.model";
import { Question } from "./question.model";

export interface Quiz {
    id: number;
    title: string;
    course: Course;
    questions: Question[];
  }
  