import { Answer } from "./answer.model";
import { Quiz } from "./quiz.model";

export interface Question {
    id: number;
    text: string;
    quiz: Quiz;
    answers: Answer[];
  }
  