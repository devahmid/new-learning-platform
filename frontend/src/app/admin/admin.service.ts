import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, timer, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalCourses: number;
  totalRevenue: number;
  newUsersThisMonth: number;
  courseCompletionRate: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  status: string;
  lastLogin?: Date;
  childrenCount?: number;
}

export interface Course {
  id: number;
  title: string;
  subject: string;
  enrollmentCount: number;
  completionRate: number;
  difficulty: string;
  duration: number;
  rating: number;
}

export interface Activity {
  id: number;
  type: string;
  description: string;
  timestamp: Date;
  userId?: number;
  userName?: string;
  severity: 'info' | 'warning' | 'error' | 'success';
}

export interface Alert {
  id: string;
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  dismissed: boolean;
}

export interface PerformanceStats {
  responseTime: number;
  uptime: string;
  memoryUsage: string;
  cpuUsage: string;
  activeConnections: number;
  requestsPerSecond: number;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  // Observables pour les données en temps réel
  private statsSubject = new BehaviorSubject<DashboardStats | null>(null);
  private usersSubject = new BehaviorSubject<User[]>([]);
  private coursesSubject = new BehaviorSubject<Course[]>([]);
  private activitiesSubject = new BehaviorSubject<Activity[]>([]);
  private alertsSubject = new BehaviorSubject<Alert[]>([]);
  private performanceSubject = new BehaviorSubject<PerformanceStats | null>(
    null
  );

  // Observables publics
  public stats$ = this.statsSubject.asObservable();
  public users$ = this.usersSubject.asObservable();
  public courses$ = this.coursesSubject.asObservable();
  public activities$ = this.activitiesSubject.asObservable();
  public alerts$ = this.alertsSubject.asObservable();
  public performance$ = this.performanceSubject.asObservable();

  // Timer pour le rafraîchissement automatique
  private refreshTimer: any;

  constructor(private http: HttpClient) {
    // Désactivé pour éviter la saturation du réseau et les "sauts" d'écran
    // this.startAutoRefresh();
  }

  // 🚀 Démarrer le rafraîchissement automatique (désactivé par défaut)
  private startAutoRefresh(): void {
    this.refreshTimer = timer(0, 300000); // Rafraîchir toutes les 5 minutes (au lieu de 30s)
    this.refreshTimer.subscribe(() => {
      this.refreshAllData();
    });
  }

  // 🔄 Méthode publique pour activer le rafraîchissement automatique si nécessaire
  public enableAutoRefresh(): void {
    if (!this.refreshTimer) {
      this.startAutoRefresh();
    }
  }

  // ⏹️ Méthode publique pour désactiver le rafraîchissement automatique
  public disableAutoRefresh(): void {
    if (this.refreshTimer) {
      this.refreshTimer.unsubscribe();
      this.refreshTimer = null;
    }
  }

  // 🔄 Rafraîchir manuellement sans causer de "sauts" d'écran
  public refreshDataSilently(): void {
    this.refreshAllData();
  }

  // 🚫 Désactiver complètement le rafraîchissement automatique
  public disableAllAutoRefresh(): void {
    this.disableAutoRefresh();
    // Désactiver aussi le rafraîchissement des notifications
    // this.progressService.stopAutoRefresh();
  }

  // 🔄 Rafraîchir toutes les données (sans déclencher de rechargement UI)
  private refreshAllData(): void {
    // Charger les données en arrière-plan sans forcer le rechargement des composants
    this.loadDashboardStats().subscribe();
    this.loadRecentUsers().subscribe();
    this.loadPopularCourses().subscribe();
    this.loadRecentActivities().subscribe();
    this.loadSystemAlerts().subscribe();
    this.loadPerformanceStats().subscribe();
  }

  // 📊 Charger les statistiques du dashboard
  loadDashboardStats(): Observable<DashboardStats> {
    return this.http
      .get<{ success: boolean; data: any }>(
        `${this.apiUrl}/dashboard/stats`
      )
      .pipe(
        map((response) => {
          if (response.success) {
            // Transformer les données de l'API vers le format attendu
            const apiData = response.data;
            const stats: DashboardStats = {
              totalUsers: apiData.users?.total || 0,
              activeUsers: apiData.users?.active || 0,
              totalCourses: apiData.content?.courses || 0,
              totalRevenue: apiData.revenue?.total || 0, // Maintenant implémenté
              newUsersThisMonth: apiData.users?.active || 0,
              courseCompletionRate: 0 // Pas encore implémenté
            };
            this.statsSubject.next(stats);
            return stats;
          }
          throw new Error('Erreur lors du chargement des statistiques');
        }),
        catchError((error) => {
          console.error('Erreur API stats:', error);
          // Retourner des données par défaut en cas d'erreur
          const defaultStats: DashboardStats = {
            totalUsers: 0,
            activeUsers: 0,
            totalCourses: 0,
            totalRevenue: 0,
            newUsersThisMonth: 0,
            courseCompletionRate: 0,
          };
          this.statsSubject.next(defaultStats);
          return [defaultStats];
        })
      );
  }

  // 👥 Charger les utilisateurs récents
  loadRecentUsers(): Observable<User[]> {
    return this.http
      .get<{ success: boolean; data: any }>(`${this.apiUrl}/users/stats`)
      .pipe(
        map((response) => {
          if (response.success) {
            // Extraire les utilisateurs récents de la réponse
            const recentUsers = response.data.recent || [];
            this.usersSubject.next(recentUsers);
            return recentUsers;
          }
          throw new Error('Erreur lors du chargement des utilisateurs');
        }),
        catchError((error) => {
          console.error('Erreur API users:', error);
          const defaultUsers: User[] = [];
          this.usersSubject.next(defaultUsers);
          return [defaultUsers];
        })
      );
  }

  // 📚 Charger les cours populaires
  loadPopularCourses(): Observable<Course[]> {
    return this.http
      .get<{ success: boolean; data: any }>(`${this.apiUrl}/courses/stats`)
      .pipe(
        map((response) => {
          if (response.success) {
            // Extraire les cours populaires de la réponse
            const popularCourses = response.data.popular || [];
            this.coursesSubject.next(popularCourses);
            return popularCourses;
          }
          throw new Error('Erreur lors du chargement des cours');
        }),
        catchError((error) => {
          console.error('Erreur API courses:', error);
          const defaultCourses: Course[] = [];
          this.coursesSubject.next(defaultCourses);
          return [defaultCourses];
        })
      );
  }

  // 📈 Charger les activités récentes
  loadRecentActivities(): Observable<Activity[]> {
    return this.http
      .get<{ success: boolean; data: any }>(
        `${this.apiUrl}/activities/recent`
      )
      .pipe(
        map((response) => {
          if (response.success) {
            // La réponse contient directement les activités
            const activities = response.data || [];
            this.activitiesSubject.next(activities);
            return activities;
          }
          throw new Error('Erreur lors du chargement des activités');
        }),
        catchError((error) => {
          console.error('Erreur API activities:', error);
          const defaultActivities: Activity[] = [];
          this.activitiesSubject.next(defaultActivities);
          return [defaultActivities];
        })
      );
  }

  // 🚨 Charger les alertes système
  loadSystemAlerts(): Observable<Alert[]> {
    return this.http
      .get<{ success: boolean; data: Alert[] }>(`${this.apiUrl}/alerts`)
      .pipe(
        map((response) => {
          if (response.success) {
            this.alertsSubject.next(response.data);
            return response.data;
          }
          throw new Error('Erreur lors du chargement des alertes');
        }),
        catchError((error) => {
          console.error('Erreur API alerts:', error);
          const defaultAlerts: Alert[] = [];
          this.alertsSubject.next(defaultAlerts);
          return [defaultAlerts];
        })
      );
  }

  // 📱 Charger les statistiques de performance
  loadPerformanceStats(): Observable<PerformanceStats> {
    return this.http
      .get<{ success: boolean; data: PerformanceStats }>(
        `${this.apiUrl}/performance`
      )
      .pipe(
        map((response) => {
          if (response.success) {
            this.performanceSubject.next(response.data);
            return response.data;
          }
          throw new Error('Erreur lors du chargement des stats de performance');
        }),
        catchError((error) => {
          console.error('Erreur API performance:', error);
          const defaultPerformance: PerformanceStats = {
            responseTime: 0,
            uptime: '0%',
            memoryUsage: '0%',
            cpuUsage: '0%',
            activeConnections: 0,
            requestsPerSecond: 0,
          };
          this.performanceSubject.next(defaultPerformance);
          return [defaultPerformance];
        })
      );
  }

  // 🔄 Rafraîchir manuellement les données
  refreshDashboard(): Observable<any> {
    return this.http
      .get<{ success: boolean; data: any }>(`${this.apiUrl}/dashboard/refresh`)
      .pipe(
        map((response) => {
          if (response.success) {
            this.refreshAllData();
            return response.data;
          }
          throw new Error('Erreur lors du rafraîchissement');
        }),
        catchError((error) => {
          console.error('Erreur API refresh:', error);
          return [];
        })
      );
  }

  // 🚫 Fermer une alerte
  dismissAlert(alertId: string): Observable<any> {
    return this.http
      .put<{ success: boolean; data: any }>(
        `${this.apiUrl}/alerts/${alertId}/dismiss`,
        {}
      )
      .pipe(
        map((response) => {
          if (response.success) {
            // Mettre à jour la liste des alertes
            const currentAlerts = this.alertsSubject.value;
            const updatedAlerts = currentAlerts.map((alert) =>
              alert.id === alertId ? { ...alert, dismissed: true } : alert
            );
            this.alertsSubject.next(updatedAlerts);
            return response.data;
          }
          throw new Error("Erreur lors de la fermeture de l'alerte");
        }),
        catchError((error) => {
          console.error('Erreur API dismiss alert:', error);
          return [];
        })
      );
  }

  // 📊 Exporter les données du dashboard
  exportDashboardData(): Observable<any> {
    return this.http
      .get(`${this.apiUrl}/dashboard/export`, { responseType: 'blob' })
      .pipe(
        map((blob) => {
          // Créer un lien de téléchargement
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `dashboard-${
            new Date().toISOString().split('T')[0]
          }.json`;
          link.click();
          window.URL.revokeObjectURL(url);
          return blob;
        }),
        catchError((error) => {
          console.error('Erreur API export:', error);
          return [];
        })
      );
  }

  // 🔒 Vérifier les permissions
  checkPermissions(): Observable<any> {
    return this.http
      .get<{ success: boolean; data: any }>(`${this.apiUrl}/permissions`)
      .pipe(
        map((response) => {
          if (response.success) {
            return response.data;
          }
          throw new Error('Erreur lors de la vérification des permissions');
        }),
        catchError((error) => {
          console.error('Erreur API permissions:', error);
          return [
            {
              canManageUsers: false,
              canManageCourses: false,
              canViewStats: false,
              canManageSystem: false,
            },
          ];
        })
      );
  }

  // 🧹 Nettoyer les ressources
  ngOnDestroy(): void {
    if (this.refreshTimer) {
      this.refreshTimer.unsubscribe();
    }
  }

  // 📚 Récupérer tous les cours
  getAllCourses(): Observable<any[]> {
    return this.http
      .get<{ success: boolean; data: any[] }>(`${this.apiUrl}/courses`)
      .pipe(
        map((response) => {
          if (response.success) {
            return response.data;
          }
          throw new Error('Erreur lors de la récupération des cours');
        }),
        catchError((error) => {
          console.error('Erreur API getAllCourses:', error);
          throw error;
        })
      );
  }

  // 📚 Créer un nouveau cours
  createCourse(courseData: any): Observable<any> {
    return this.http
      .post<{ success: boolean; data: any }>(
        `${this.apiUrl}/courses`,
        courseData
      )
      .pipe(
        map((response) => {
          if (response.success) {
            return response.data;
          }
          throw new Error('Erreur lors de la création du cours');
        }),
        catchError((error) => {
          console.error('Erreur API createCourse:', error);
          throw error;
        })
      );
  }

  // 📚 Mettre à jour un cours existant
  updateCourse(courseId: number, courseData: any): Observable<any> {
    return this.http
      .put<{ success: boolean; data: any }>(
        `${this.apiUrl}/courses/${courseId}`,
        courseData
      )
      .pipe(
        map((response) => {
          if (response.success) {
            return response.data;
          }
          throw new Error('Erreur lors de la mise à jour du cours');
        }),
        catchError((error) => {
          console.error('Erreur API updateCourse:', error);
          throw error;
        })
      );
  }

  // 📚 Récupérer un cours par ID
  getCourseById(courseId: number): Observable<any> {
    return this.http
      .get<{ success: boolean; data: any }>(
        `${this.apiUrl}/courses/${courseId}`
      )
      .pipe(
        map((response) => {
          if (response.success) {
            return response.data;
          }
          throw new Error('Erreur lors de la récupération du cours');
        }),
        catchError((error) => {
          console.error('Erreur API getCourseById:', error);
          throw error;
        })
      );
  }

  // 📚 Supprimer un cours
  deleteCourse(courseId: number): Observable<any> {
    return this.http
      .delete<{ success: boolean; data: any }>(
        `${this.apiUrl}/courses/${courseId}`
      )
      .pipe(
        map((response) => {
          if (response.success) {
            return response.data;
          }
          throw new Error('Erreur lors de la suppression du cours');
        }),
        catchError((error) => {
          console.error('Erreur API deleteCourse:', error);
          throw error;
        })
      );
  }

  // 📚 Récupérer toutes les catégories
  getCategories(): Observable<any[]> {
    return this.http
      .get<{ success: boolean; data: any[] }>(`${this.apiUrl}/categories`)
      .pipe(
        map((response) => {
          if (response.success) {
            return response.data;
          }
          throw new Error('Erreur lors de la récupération des catégories');
        }),
        catchError((error) => {
          console.error('Erreur API getCategories:', error);
          return [];
        })
      );
  }

  // 🏷️ Créer une catégorie
  createCategory(categoryData: any): Observable<any> {
    return this.http
      .post<{ success: boolean; data: any }>(
        `${this.apiUrl}/categories`,
        categoryData
      )
      .pipe(
        map((response) => {
          if (response.success) {
            return response.data;
          }
          throw new Error('Erreur lors de la création de la catégorie');
        }),
        catchError((error) => {
          console.error('Erreur API createCategory:', error);
          throw error;
        })
      );
  }

  // 🏷️ Mettre à jour une catégorie
  updateCategory(categoryId: number, categoryData: any): Observable<any> {
    return this.http
      .put<{ success: boolean; data: any }>(
        `${this.apiUrl}/categories/${categoryId}`,
        categoryData
      )
      .pipe(
        map((response) => {
          if (response.success) {
            return response.data;
          }
          throw new Error('Erreur lors de la mise à jour de la catégorie');
        }),
        catchError((error) => {
          console.error('Erreur API updateCategory:', error);
          throw error;
        })
      );
  }

  // 🏷️ Supprimer une catégorie
  deleteCategory(categoryId: number): Observable<any> {
    return this.http
      .delete<{ success: boolean; data: any }>(
        `${this.apiUrl}/categories/${categoryId}`
      )
      .pipe(
        map((response) => {
          if (response.success) {
            return response.data;
          }
          throw new Error('Erreur lors de la suppression de la catégorie');
        }),
        catchError((error) => {
          console.error('Erreur API deleteCategory:', error);
          throw error;
        })
      );
  }

  // 📚 Récupérer toutes les sous-catégories
  getSubcategories(): Observable<any[]> {
    return this.http
      .get<{ success: boolean; data: any[] }>(`${this.apiUrl}/subcategories`)
      .pipe(
        map((response) => {
          if (response.success) {
            return response.data;
          }
          throw new Error('Erreur lors de la récupération des sous-catégories');
        }),
        catchError((error) => {
          console.error('Erreur API getSubcategories:', error);
          return [];
        })
      );
  }


  // 🏷️ Créer une sous-catégorie
  createSubcategory(subcategoryData: any): Observable<any> {
    return this.http
      .post<{ success: boolean; data: any }>(
        `${this.apiUrl}/subcategories`,
        subcategoryData
      )
      .pipe(
        map((response) => {
          if (response.success) {
            return response.data;
          }
          throw new Error('Erreur lors de la création de la sous-catégorie');
        }),
        catchError((error) => {
          console.error('Erreur API createSubcategory:', error);
          throw error;
        })
      );
  }

  // 🏷️ Mettre à jour une sous-catégorie
  updateSubcategory(
    subcategoryId: number,
    subcategoryData: any
  ): Observable<any> {
    return this.http
      .put<{ success: boolean; data: any }>(
        `${this.apiUrl}/subcategories/${subcategoryId}`,
        subcategoryData
      )
      .pipe(
        map((response) => {
          if (response.success) {
            return response.data;
          }
          throw new Error('Erreur lors de la mise à jour de la sous-catégorie');
        }),
        catchError((error) => {
          console.error('Erreur API updateSubcategory:', error);
          throw error;
        })
      );
  }

  // 🏷️ Supprimer une sous-catégorie
  deleteSubcategory(subcategoryId: number): Observable<any> {
    return this.http
      .delete<{ success: boolean; data: any }>(
        `${this.apiUrl}/subcategories/${subcategoryId}`
      )
      .pipe(
        map((response) => {
          if (response.success) {
            return response.data;
          }
          throw new Error('Erreur lors de la suppression de la sous-catégorie');
        }),
        catchError((error) => {
          console.error('Erreur API deleteSubcategory:', error);
          throw error;
        })
      );
  }

  // 📚 Récupérer tous les niveaux
  getLevels(): Observable<any[]> {
    return this.http
      .get<any[]>(`${environment.apiUrl}/levels`)
      .pipe(
        map((response) => {
          // L'API retourne directement un tableau de niveaux
          return response || [];
        }),
        catchError((error) => {
          console.error('Erreur API getLevels:', error);
          return [];
        })
      );
  }

  // 📚 Créer un niveau
  createLevel(levelData: any): Observable<any> {
    return this.http
      .post<{ success: boolean; data: any }>(`${this.apiUrl}/levels`, levelData)
      .pipe(
        map((response) => {
          if (response.success) {
            return response.data;
          }
          throw new Error('Erreur lors de la création du niveau');
        }),
        catchError((error) => {
          console.error('Erreur API createLevel:', error);
          throw error;
        })
      );
  }

  // 📚 Mettre à jour un niveau
  updateLevel(levelId: number, levelData: any): Observable<any> {
    return this.http
      .put<{ success: boolean; data: any }>(
        `${this.apiUrl}/levels/${levelId}`,
        levelData
      )
      .pipe(
        map((response) => {
          if (response.success) {
            return response.data;
          }
          throw new Error('Erreur lors de la mise à jour du niveau');
        }),
        catchError((error) => {
          console.error('Erreur API updateLevel:', error);
          throw error;
        })
      );
  }

  // 📚 Supprimer un niveau
  deleteLevel(levelId: number): Observable<any> {
    return this.http
      .delete<{ success: boolean; data: any }>(
        `${this.apiUrl}/levels/${levelId}`
      )
      .pipe(
        map((response) => {
          if (response.success) {
            return response.data;
          }
          throw new Error('Erreur lors de la suppression du niveau');
        }),
        catchError((error) => {
          console.error('Erreur API deleteLevel:', error);
          throw error;
        })
      );
  }
}
