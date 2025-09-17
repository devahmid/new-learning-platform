// =====================================================
// MODÈLES POUR LE SUIVI DE PROGRESSION DÉTAILLÉ
// =====================================================

export interface DetailedProgress {
  // Progression générale
  overallProgress: number;
  coursesCompleted: number;
  totalCourses: number;
  
  // Progression par matière
  subjectProgress: SubjectProgress[];
  
  // Progression par leçon
  lessonProgress: LessonProgress[];
  
  // Statistiques d'apprentissage
  learningStats: LearningStats;
  
  // Statistiques vidéo
  videoStats: VideoStats;
  
  // Récompenses et achievements
  achievements: Achievement[];
  level: number;
  experiencePoints: number;
  
  // Recommandations
  recommendations: Recommendation[];
  
  // Métadonnées
  lastUpdated: string;
  childId: number;
}

export interface SubjectProgress {
  subject: string;
  progress: number;
  lessonsCompleted: number;
  totalLessons: number;
  averageScore: number;
  timeSpent: number; // en minutes
  lastActivity: string;
  color?: string; // pour l'affichage
}

export interface LessonProgress {
  lessonId: number;
  lessonTitle: string;
  courseId: number;
  courseTitle: string;
  progress: number;
  timeSpent: number;
  attempts: number;
  bestScore: number;
  lastAttempt: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'review_needed';
}

export interface LearningStats {
  totalStudyTime: number; // en minutes
  averageSessionDuration: number;
  studyStreak: number; // jours consécutifs
  preferredStudyTime: 'morning' | 'afternoon' | 'evening' | 'night';
  difficultyAreas: string[]; // matières difficiles
  strongAreas: string[]; // matières fortes
  lastStudyDate: string;
  totalSessions: number;
  averageScore: number;
}

export interface Achievement {
  id: number;
  achievementType: 'study_streak' | 'score_milestone' | 'completion' | 'time_milestone' | 'improvement';
  achievementName: string;
  description: string;
  icon: string;
  points: number;
  unlockedAt: string;
  metadata?: any;
}

export interface Recommendation {
  id: number;
  recommendationType: 'review' | 'practice' | 'new_lesson' | 'take_break' | 'focus_area';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  actionRequired: string;
  subject?: string;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  estimatedTime?: number; // en minutes
  isRead: boolean;
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface ProgressSession {
  id: number;
  userId: number;
  courseId?: number;
  lessonId?: number;
  sessionStart: string;
  sessionEnd?: string;
  duration?: number; // en minutes
  sessionType: 'lesson' | 'quiz' | 'exercise' | 'review' | 'practice';
  progressStart: number;
  progressEnd: number;
  progressGained: number;
  score?: number;
  attempts: number;
  timePerQuestion?: number; // en secondes
  deviceType: 'desktop' | 'tablet' | 'mobile';
  browserInfo?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface ProgressReport {
  id: number;
  userId: number;
  parentId?: number;
  reportType: 'daily' | 'weekly' | 'monthly' | 'custom';
  periodStart: string;
  periodEnd: string;
  reportData: any; // Données du rapport
  generatedAt: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface ProgressNotification {
  id: number;
  userId: number;
  parentId?: number;
  notificationType: 'progress_milestone' | 'achievement_unlocked' | 'slow_progress' | 'study_reminder' | 'report_ready' | 'recommendation';
  priority: 'low' | 'normal' | 'high';
  title: string;
  message: string;
  actionUrl?: string;
  courseId?: number;
  lessonId?: number;
  metadata?: any;
  isRead: boolean;
  readAt?: string;
  isSent: boolean;
  sentAt?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface ProgressInsight {
  id: number;
  userId: number;
  insightType: 'learning_pattern' | 'performance_trend' | 'difficulty_analysis' | 'recommendation_insight';
  title: string;
  description: string;
  insightData: any;
  confidence: number; // 0-1
  impact: 'low' | 'medium' | 'high';
  isActive: boolean;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

// =====================================================
// INTERFACES POUR LE DASHBOARD PARENT
// =====================================================

export interface ParentOverview {
  childrenOverview: ChildOverview[];
  totalChildren: number;
  lastUpdated: string;
}

export interface ChildOverview {
  childId: number;
  childName: string;
  overallProgress: number;
  coursesInProgress: number;
  lastActivity?: string;
  needsAttention: boolean;
  globalAverageScore: number;
  studyStreak: number;
}

export interface ProgressAnalytics {
  analytics: any[];
  sessionStats: SessionStats;
  studyPatterns: StudyPattern[];
  difficultyAnalysis: DifficultyAnalysis[];
}

export interface SessionStats {
  totalSessions: number;
  totalDuration: number;
  averageDuration: number;
  totalProgressGained: number;
  averageProgressGained: number;
  averageScore: number;
  bestScore: number;
  coursesStudied: number;
  lessonsStudied: number;
}

export interface StudyPattern {
  studyHour: number;
  studyDay: string;
  avgDuration: number;
  sessionCount: number;
}

export interface DifficultyAnalysis {
  subject: string;
  avgScore: number;
  lessonCount: number;
  reviewCount: number;
}

// =====================================================
// INTERFACES POUR LES RÉPONSES API
// =====================================================

export interface ProgressResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface DetailedProgressResponse extends ProgressResponse {
  data: DetailedProgress;
}

export interface ParentOverviewResponse extends ProgressResponse {
  data: ParentOverview;
}

export interface ProgressAnalyticsResponse extends ProgressResponse {
  data: ProgressAnalytics;
}

export interface SessionStartResponse extends ProgressResponse {
  data: {
    sessionId: number;
    message: string;
  };
}

// =====================================================
// INTERFACES POUR LES FILTRES ET OPTIONS
// =====================================================

export interface ProgressFilters {
  period?: 'day' | 'week' | 'month' | 'year' | 'all';
  subject?: string;
  courseId?: number;
  status?: 'not_started' | 'in_progress' | 'completed' | 'review_needed';
  dateFrom?: string;
  dateTo?: string;
}

export interface ProgressOptions {
  includeInactive?: boolean;
  includeRecommendations?: boolean;
  includeInsights?: boolean;
  includeAchievements?: boolean;
  includeVideoStats?: boolean;
  limit?: number;
  offset?: number;
}

// =====================================================
// INTERFACES POUR LE SUIVI VIDÉO
// =====================================================

export interface VideoStats {
  totalWatchTime: number; // en minutes
  totalSessions: number;
  averageWatchTime: number; // en minutes
  completionRate: number; // pourcentage
  mostWatchedLessons: MostWatchedLesson[];
  watchPatterns: WatchPatterns;
}

export interface MostWatchedLesson {
  lessonId: number;
  lessonTitle: string;
  watchCount: number;
  totalWatchTime: number;
  completionRate: number;
  lastWatched: string;
}

export interface WatchPatterns {
  averagePauseCount: number;
  averageSeekCount: number;
  averageReplayCount: number;
  preferredQuality: string;
  averagePlaybackSpeed: number;
  mostWatchedSegments: VideoSegment[];
  skipPoints: VideoSegment[];
}

export interface VideoSegment {
  startTime: number; // en secondes
  endTime: number; // en secondes
  watchCount: number;
  duration: number; // en secondes
}
