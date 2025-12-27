export type QuestionType = 'multiple_choice' | 'text' | 'checkbox' | 'radio' | 'textarea' | 'rating';

export interface EvaluationOption {
  id?: number;
  text: string;
  order?: number;
  isCorrect?: boolean; // Indique si cette option est la bonne réponse
}

export interface EvaluationSection {
  id?: number;
  evaluationId?: number;
  title: string;
  description?: string;
  order: number;
}

export interface EvaluationQuestion {
  id?: number;
  evaluationId?: number;
  sectionId?: number; // ID de la section à laquelle appartient la question
  text: string;
  type: QuestionType;
  required: boolean;
  order: number;
  options?: EvaluationOption[]; // Pour les questions à choix multiples
  placeholder?: string; // Pour les champs texte
  minLength?: number; // Pour les champs texte
  maxLength?: number; // Pour les champs texte
  minRating?: number; // Pour les questions de notation
  maxRating?: number; // Pour les questions de notation
}

export interface EvaluationResponse {
  id?: number;
  evaluationId: number;
  userId?: number;
  childId?: number; // ID de l'enfant qui a répondu
  classeId?: number; // ID de la classe de l'enfant
  childName?: string; // Nom complet de l'enfant
  classeName?: string; // Nom de la classe
  score?: number; // Score total
  totalQuestions?: number; // Nombre total de questions
  correctAnswers?: number; // Nombre de bonnes réponses
  percentage?: number; // Pourcentage de réussite
  evaluationTitle?: string; // Titre de l'évaluation
  evaluationDescription?: string; // Description de l'évaluation
  courseId?: number; // ID du cours associé
  lessonId?: number; // ID de la leçon associée
  child?: { // Informations complètes de l'enfant
    id: number;
    firstName: string;
    lastName: string;
    classeId?: number;
    classeName?: string;
  };
  responses: QuestionResponse[];
  submittedAt?: Date;
  createdAt?: Date;
}

export interface QuestionResponse {
  questionId: number;
  value: string | number | string[]; // Peut être une réponse unique ou multiple
  textValue?: string; // Pour les réponses texte
}

export interface Evaluation {
  id?: number;
  title: string;
  description?: string;
  instructions?: string; // Instructions détaillées au début (avec formatage HTML/markdown)
  specialInstructions?: string; // Instructions spéciales (ex: email pour devoirs)
  courseId?: number;
  lessonId?: number;
  classeIds?: number[]; // IDs des classes pour les évaluations générales
  classes?: any[]; // Objets classes complets
  isActive: boolean;
  allowMultipleSubmissions: boolean;
  showResults: boolean;
  startDate?: Date;
  endDate?: Date;
  sections?: EvaluationSection[]; // Sections de l'évaluation
  questions: EvaluationQuestion[];
  createdAt?: Date;
  updatedAt?: Date;
}

