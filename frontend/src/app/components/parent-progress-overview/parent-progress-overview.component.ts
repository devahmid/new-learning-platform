import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { 
  ParentOverview, 
  ChildOverview, 
  DetailedProgress,
  ProgressAnalytics
} from '../../models/progress.model';
import { ProgressTrackingService } from '../../services/progress-tracking.service';
import { ProgressAnalyticsService } from '../../services/progress-analytics.service';
import { ProgressNotificationsService } from '../../services/progress-notifications.service';
import { ProgressDashboardComponent } from '../progress-dashboard/progress-dashboard.component';
import { CourseService } from '../../services/course.service';

@Component({
  selector: 'app-parent-progress-overview',
  standalone: true,
  imports: [CommonModule, FormsModule, ProgressDashboardComponent],
  templateUrl: './parent-progress-overview.component.html',
  styleUrls: ['./parent-progress-overview.component.scss']
})
export class ParentProgressOverviewComponent implements OnInit, OnDestroy {
  // Données principales
  parentOverview: ParentOverview | null = null;
  selectedChild: ChildOverview | null = null;
  selectedChildDetailedProgress: DetailedProgress | null = null;
  selectedChildAnalytics: ProgressAnalytics | null = null;
  
  // États de chargement
  isLoading = true;
  isLoadingChildDetails = false;
  
  // Statistiques de quiz
  quizStats: any = null;
  isLoadingQuizStats = false;
  
  // Filtres et options
  selectedPeriod = 'week';
  showOnlyNeedingAttention = false;
  
  // Données filtrées
  filteredChildren: ChildOverview[] = [];
  
  // Statistiques globales
  totalChildren = 0;
  childrenNeedingAttention = 0;
  averageProgress = 0;
  totalStudyTime = 0;
  
  // Gestion de la destruction
  private destroy$ = new Subject<void>();

  constructor(
    private progressService: ProgressTrackingService,
    private analyticsService: ProgressAnalyticsService,
    private notificationsService: ProgressNotificationsService,
    private courseService: CourseService
  ) {}

  ngOnInit(): void {
    this.loadParentOverview();
    this.loadQuizStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Charger la vue d'ensemble parent
   */
  loadParentOverview(): void {
    this.isLoading = true;
    
    this.progressService.getParentOverview()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (overview) => {
          this.parentOverview = overview;
          this.processOverviewData();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement de la vue d\'ensemble:', error);
          this.isLoading = false;
        }
      });
  }

  /**
   * Traiter les données de vue d'ensemble
   */
  private processOverviewData(): void {
    if (!this.parentOverview) return;

    this.totalChildren = this.parentOverview.totalChildren;
    this.filteredChildren = [...this.parentOverview.childrenOverview];
    
    // Calculer les statistiques globales
    this.calculateGlobalStats();
    
    // Appliquer les filtres
    this.applyFilters();
  }

  /**
   * Calculer les statistiques globales
   */
  private calculateGlobalStats(): void {
    if (!this.parentOverview) return;

    const children = this.parentOverview.childrenOverview;
    
    // Enfants nécessitant une attention
    this.childrenNeedingAttention = children.filter(child => child.needsAttention).length;
    
    // Progression moyenne
    this.averageProgress = children.length > 0 
      ? Math.round(children.reduce((sum, child) => sum + child.overallProgress, 0) / children.length)
      : 0;
    
    // Temps d'étude total (approximation basée sur la progression)
    this.totalStudyTime = children.reduce((sum, child) => sum + (child.overallProgress * 2), 0);
  }

  /**
   * Appliquer les filtres
   */
  applyFilters(): void {
    if (!this.parentOverview) return;

    let filtered = [...this.parentOverview.childrenOverview];
    
    // Filtrer par attention nécessaire
    if (this.showOnlyNeedingAttention) {
      filtered = filtered.filter(child => child.needsAttention);
    }
    
    this.filteredChildren = filtered;
  }

  /**
   * Sélectionner un enfant pour voir les détails
   */
  selectChild(child: ChildOverview): void {
    this.selectedChild = child;
    this.loadChildDetailedProgress(child.childId);
  }

  /**
   * Charger la progression détaillée d'un enfant
   */
  loadChildDetailedProgress(childId: number): void {
    this.isLoadingChildDetails = true;
    
    // Charger la progression détaillée et les analytics en parallèle
    forkJoin({
      detailedProgress: this.progressService.getChildDetailedProgress(childId),
      analytics: this.analyticsService.getChildAnalytics(childId, this.selectedPeriod)
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data) => {
        this.selectedChildDetailedProgress = data.detailedProgress;
        this.selectedChildAnalytics = data.analytics;
        this.isLoadingChildDetails = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des détails:', error);
        this.isLoadingChildDetails = false;
      }
    });
  }

  /**
   * Changer la période d'analyse
   */
  onPeriodChange(period: string): void {
    this.selectedPeriod = period;
    if (this.selectedChild) {
      this.loadChildDetailedProgress(this.selectedChild.childId);
    }
  }

  /**
   * Basculer le filtre d'attention
   */
  toggleAttentionFilter(): void {
    this.showOnlyNeedingAttention = !this.showOnlyNeedingAttention;
    this.applyFilters();
  }

  /**
   * Rafraîchir les données
   */
  refreshData(): void {
    this.loadParentOverview();
  }

  /**
   * Fermer les détails de l'enfant sélectionné
   */
  closeChildDetails(): void {
    this.selectedChild = null;
    this.selectedChildDetailedProgress = null;
    this.selectedChildAnalytics = null;
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
   * Formater la date de dernière activité
   */
  formatLastActivity(dateString: string | undefined): string {
    if (!dateString) return 'Jamais';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Aujourd\'hui';
    if (diffInDays === 1) return 'Hier';
    if (diffInDays < 7) return `Il y a ${diffInDays} jours`;
    if (diffInDays < 30) return `Il y a ${Math.floor(diffInDays / 7)} semaines`;
    
    return date.toLocaleDateString('fr-FR');
  }

  /**
   * Obtenir l'icône d'état d'un enfant
   */
  getChildStatusIcon(child: ChildOverview): string {
    if (child.needsAttention) return 'exclamation-triangle';
    if (child.overallProgress >= 90) return 'trophy';
    if (child.overallProgress >= 70) return 'star';
    if (child.overallProgress >= 50) return 'check-circle';
    return 'clock';
  }

  /**
   * Obtenir la couleur d'état d'un enfant
   */
  getChildStatusColor(child: ChildOverview): string {
    if (child.needsAttention) return 'text-red-600';
    if (child.overallProgress >= 90) return 'text-green-600';
    if (child.overallProgress >= 70) return 'text-blue-600';
    if (child.overallProgress >= 50) return 'text-yellow-600';
    return 'text-gray-600';
  }

  /**
   * Obtenir le score de motivation d'un enfant
   */
  getChildMotivationScore(child: ChildOverview): number {
    // Calculer un score de motivation basé sur les données disponibles
    let score = 0;
    
    // Facteur progression (40%)
    score += child.overallProgress * 0.4;
    
    // Facteur série d'étude (30%)
    score += Math.min(100, child.studyStreak * 10) * 0.3;
    
    // Facteur score moyen (30%)
    score += child.globalAverageScore * 0.3;
    
    return Math.round(score);
  }

  /**
   * Obtenir les recommandations pour un enfant
   */
  getChildRecommendations(child: ChildOverview): string[] {
    const recommendations: string[] = [];
    
    if (child.needsAttention) {
      recommendations.push('Cet enfant nécessite une attention particulière');
    }
    
    if (child.overallProgress < 50) {
      recommendations.push('Encouragez une étude plus régulière');
    }
    
    if (child.globalAverageScore < 70) {
      recommendations.push('Concentrez-vous sur la révision des leçons');
    }
    
    if (child.studyStreak < 3) {
      recommendations.push('Essayez d\'établir une routine d\'étude quotidienne');
    }
    
    return recommendations;
  }

  /**
   * Obtenir le pourcentage d'enfants avec une bonne progression
   */
  getGoodProgressPercentage(): number {
    if (!this.parentOverview) return 0;
    
    const goodProgressCount = this.parentOverview.childrenOverview.filter(
      child => child.overallProgress >= 70
    ).length;
    
    return Math.round((goodProgressCount / this.parentOverview.childrenOverview.length) * 100);
  }

  /**
   * Obtenir le pourcentage d'enfants actifs
   */
  getActiveChildrenPercentage(): number {
    if (!this.parentOverview) return 0;
    
    const activeCount = this.parentOverview.childrenOverview.filter(
      child => child.lastActivity && new Date(child.lastActivity) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;
    
    return Math.round((activeCount / this.parentOverview.childrenOverview.length) * 100);
  }

  /**
   * Getters pour les statistiques de quiz
   */
  get totalQuizzesCompleted(): number {
    return this.quizStats?.stats?.totalQuizzes || 0;
  }

  get averageQuizScore(): number {
    return Math.round(this.quizStats?.stats?.averageScore || 0);
  }

  get bestQuizScore(): number {
    return this.quizStats?.stats?.bestScore || 0;
  }

  get excellentQuizCount(): number {
    return this.quizStats?.stats?.excellentCount || 0;
  }

  /**
   * Charger les statistiques de quiz
   */
  loadQuizStats(): void {
    this.isLoadingQuizStats = true;
    
    this.courseService.getQuizProgressStats().subscribe({
      next: (response) => {
        if (response.success) {
          this.quizStats = response.data;
          console.log('Statistiques de quiz chargées:', this.quizStats);
        }
        this.isLoadingQuizStats = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des statistiques de quiz:', error);
        this.isLoadingQuizStats = false;
      }
    });
  }
}
