import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { 
  DetailedProgress, 
  SubjectProgress, 
  LessonProgress, 
  Achievement, 
  Recommendation,
  ProgressAnalytics
} from '../../models/progress.model';
import { ProgressTrackingService } from '../../services/progress-tracking.service';
import { ProgressAnalyticsService } from '../../services/progress-analytics.service';
import { ProgressNotificationsService } from '../../services/progress-notifications.service';

@Component({
  selector: 'app-progress-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './progress-dashboard.component.html',
  styleUrls: ['./progress-dashboard.component.scss']
})
export class ProgressDashboardComponent implements OnInit, OnDestroy {
  @Input() childId!: number;
  @Input() showAnalytics: boolean = true;
  @Input() showRecommendations: boolean = true;
  @Input() showAchievements: boolean = true;

  // Données de progression
  detailedProgress: DetailedProgress | null = null;
  analytics: ProgressAnalytics | null = null;
  
  // États de chargement
  isLoading = true;
  isLoadingAnalytics = false;
  
  // Filtres et options
  selectedPeriod = 'week';
  selectedSubject = 'all';
  
  // Données filtrées
  filteredSubjectProgress: SubjectProgress[] = [];
  filteredLessonProgress: LessonProgress[] = [];
  
  // Statistiques calculées
  overallProgress = 0;
  totalStudyTime = 0;
  studyStreak = 0;
  averageScore = 0;
  motivationScore = 0;
  
  // Recommandations et insights
  recommendations: Recommendation[] = [];
  insights: string[] = [];
  improvementAreas: string[] = [];
  
  // Gestion de la destruction
  private destroy$ = new Subject<void>();

  constructor(
    private progressService: ProgressTrackingService,
    private analyticsService: ProgressAnalyticsService,
    private notificationsService: ProgressNotificationsService
  ) {}

  ngOnInit(): void {
    if (this.childId) {
      this.loadProgressData();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Charger toutes les données de progression
   */
  loadProgressData(): void {
    this.isLoading = true;
    
    const progressOptions = {
      includeRecommendations: this.showRecommendations,
      includeInsights: true,
      includeAchievements: this.showAchievements
    };

    // Charger la progression détaillée
    this.progressService.getChildDetailedProgress(this.childId, progressOptions)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (progress) => {
          this.detailedProgress = progress;
          this.processProgressData();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement de la progression:', error);
          this.isLoading = false;
        }
      });

    // Charger les analytics si activées
    if (this.showAnalytics) {
      this.loadAnalytics();
    }
  }

  /**
   * Charger les analytics de progression
   */
  loadAnalytics(): void {
    this.isLoadingAnalytics = true;
    
    this.analyticsService.getChildAnalytics(this.childId, this.selectedPeriod)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (analytics) => {
          this.analytics = analytics;
          this.processAnalyticsData();
          this.isLoadingAnalytics = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des analytics:', error);
          this.isLoadingAnalytics = false;
        }
      });
  }

  /**
   * Traiter les données de progression
   */
  private processProgressData(): void {
    if (!this.detailedProgress) return;

    // Calculer les statistiques globales
    this.overallProgress = this.detailedProgress.overallProgress;
    this.totalStudyTime = this.detailedProgress.learningStats.totalStudyTime;
    this.studyStreak = this.detailedProgress.learningStats.studyStreak;
    this.averageScore = this.detailedProgress.learningStats.averageScore;

    // Filtrer les données selon les sélections
    this.applyFilters();

    // Traiter les recommandations
    this.recommendations = this.detailedProgress.recommendations || [];
  }

  /**
   * Traiter les données d'analytics
   */
  private processAnalyticsData(): void {
    if (!this.analytics) return;

    // Calculer le score de motivation
    this.motivationScore = this.analyticsService.calculateMotivationScore(this.analytics);

    // Générer les recommandations basées sur les analytics
    this.insights = this.analyticsService.generateRecommendations(this.analytics);

    // Identifier les zones d'amélioration
    this.improvementAreas = this.analyticsService.identifyImprovementAreas(this.analytics);
  }

  /**
   * Appliquer les filtres aux données
   */
  applyFilters(): void {
    if (!this.detailedProgress) return;

    // Filtrer par matière
    this.filteredSubjectProgress = this.selectedSubject === 'all' 
      ? this.detailedProgress.subjectProgress
      : this.detailedProgress.subjectProgress.filter(subject => subject.subject === this.selectedSubject);

    // Filtrer les leçons par matière sélectionnée
    if (this.selectedSubject !== 'all') {
      this.filteredLessonProgress = this.detailedProgress.lessonProgress.filter(
        lesson => lesson.courseTitle === this.selectedSubject
      );
    } else {
      this.filteredLessonProgress = this.detailedProgress.lessonProgress;
    }
  }

  /**
   * Changer la période d'analyse
   */
  onPeriodChange(period: string): void {
    this.selectedPeriod = period;
    if (this.showAnalytics) {
      this.loadAnalytics();
    }
  }

  /**
   * Changer la matière sélectionnée
   */
  onSubjectChange(subject: string): void {
    this.selectedSubject = subject;
    this.applyFilters();
  }

  /**
   * Rafraîchir les données
   */
  refreshData(): void {
    this.loadProgressData();
  }

  /**
   * Obtenir la couleur de progression
   */
  getProgressColor(progress: number): string {
    return this.progressService.getProgressColor(progress);
  }

  /**
   * Obtenir le label de progression
   */
  getProgressLabel(progress: number): string {
    return this.progressService.getProgressLabel(progress);
  }

  /**
   * Formater le temps d'étude
   */
  formatStudyTime(minutes: number): string {
    return this.progressService.formatStudyTime(minutes);
  }

  /**
   * Obtenir l'icône d'un achievement
   */
  getAchievementIcon(achievement: Achievement): string {
    return achievement.icon || 'trophy';
  }

  /**
   * Obtenir la couleur d'un achievement
   */
  getAchievementColor(achievement: Achievement): string {
    const colorMap: { [key: string]: string } = {
      'study_streak': 'text-orange-500',
      'score_milestone': 'text-green-500',
      'completion': 'text-blue-500',
      'time_milestone': 'text-purple-500',
      'improvement': 'text-yellow-500'
    };
    return colorMap[achievement.achievementType] || 'text-gray-500';
  }

  /**
   * Obtenir la couleur de priorité d'une recommandation
   */
  getRecommendationPriorityColor(priority: string): string {
    const colorMap: { [key: string]: string } = {
      'urgent': 'bg-red-100 text-red-800',
      'high': 'bg-orange-100 text-orange-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'low': 'bg-gray-100 text-gray-800'
    };
    return colorMap[priority] || 'bg-gray-100 text-gray-800';
  }

  /**
   * Marquer une recommandation comme terminée
   */
  markRecommendationAsCompleted(recommendationId: number): void {
    // Implémenter la logique pour marquer comme terminée
    console.log('Marquer la recommandation comme terminée:', recommendationId);
  }

  /**
   * Obtenir les matières uniques pour le filtre
   */
  getUniqueSubjects(): string[] {
    if (!this.detailedProgress) return [];
    return ['all', ...new Set(this.detailedProgress.subjectProgress.map(s => s.subject))];
  }

  /**
   * Obtenir le pourcentage de progression d'une matière
   */
  getSubjectProgressPercentage(subject: SubjectProgress): number {
    if (subject.totalLessons === 0) return 0;
    return Math.round((subject.lessonsCompleted / subject.totalLessons) * 100);
  }

  /**
   * Obtenir le statut d'une leçon
   */
  getLessonStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'not_started': 'bg-gray-100 text-gray-800',
      'in_progress': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'review_needed': 'bg-red-100 text-red-800'
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  }

  /**
   * Obtenir le label d'un statut de leçon
   */
  getLessonStatusLabel(status: string): string {
    const labelMap: { [key: string]: string } = {
      'not_started': 'Non commencée',
      'in_progress': 'En cours',
      'completed': 'Terminée',
      'review_needed': 'Révision nécessaire'
    };
    return labelMap[status] || 'Inconnu';
  }
}
