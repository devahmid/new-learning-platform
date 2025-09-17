import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../admin.service';

interface PopularCourse {
  id: number;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  level: string;
  instructor: string;
  totalStudents: number;
  totalLessons: number;
  averageRating: number;
  totalRatings: number;
  completionRate: number;
  totalRevenue: number;
  createdAt: Date;
  lastActivity: Date;
  trending: boolean;
  featured: boolean;
}

interface CourseAnalytics {
  totalEnrollments: number;
  averageCompletionRate: number;
  totalRevenue: number;
  topPerformingCategory: string;
  growthRate: number;
  studentSatisfaction: number;
}

@Component({
  selector: 'app-populaires',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './populaires.component.html',
  styleUrl: './populaires.component.scss',
})
export class PopulairesComponent implements OnInit {
  popularCourses: PopularCourse[] = [];
  isLoading = false;
  hasError = false;
  errorMessage = '';

  // Filtres et tri
  selectedCategory = 'all';
  selectedLevel = 'all';
  selectedSort = 'students';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Pagination
  currentPage = 1;
  itemsPerPage = 12;
  totalItems = 0;

  // Stats pour l'affichage
  stats = {
    totalStudents: 0,
    growthRate: 0,
    studentSatisfaction: 0,
    topPerformingCategory: '',
  };

  // Analytics
  analytics: CourseAnalytics = {
    totalEnrollments: 0,
    averageCompletionRate: 0,
    totalRevenue: 0,
    topPerformingCategory: '',
    growthRate: 0,
    studentSatisfaction: 0,
  };

  // Options de filtre
  categoryOptions = [
    { value: 'all', label: 'Toutes les catégories' },
    { value: 'langues', label: 'Langues' },
    { value: 'sciences', label: 'Sciences' },
    { value: 'mathematiques', label: 'Mathématiques' },
    { value: 'histoire', label: 'Histoire' },
    { value: 'geographie', label: 'Géographie' },
  ];

  levelOptions = [
    { value: 'all', label: 'Tous les niveaux' },
    { value: 'debutant', label: 'Débutant' },
    { value: 'intermediaire', label: 'Intermédiaire' },
    { value: 'avance', label: 'Avancé' },
  ];

  sortOptions = [
    { value: 'students', label: "Nombre d'élèves" },
    { value: 'rating', label: 'Note moyenne' },
    { value: 'completion', label: 'Taux de completion' },
    { value: 'revenue', label: 'Revenus' },
    { value: 'recent', label: 'Récent' },
  ];

  constructor(private adminService: AdminService, public router: Router) {}

  ngOnInit() {
    this.loadPopularCourses();
    this.loadAnalytics();
  }

  // 🚀 Charger les cours populaires
  async loadPopularCourses() {
    try {
      this.isLoading = true;
      this.hasError = false;

      // Simulation de données pour l'instant
      // À remplacer par un vrai appel API
      this.popularCourses = this.generateMockPopularCourses();
      this.totalItems = this.popularCourses.length;

      this.applyFiltersAndSort();
    } catch (error) {
      this.hasError = true;
      this.errorMessage = 'Erreur lors du chargement des cours populaires';
      console.error('Erreur loadPopularCourses:', error);
    } finally {
      this.isLoading = false;
    }
  }

  // 📊 Charger les analytics
  async loadAnalytics() {
    try {
      // Simulation de données pour l'instant
      this.analytics = {
        totalEnrollments: 2847,
        averageCompletionRate: 78.5,
        totalRevenue: 45620,
        topPerformingCategory: 'Langues',
        growthRate: 23.4,
        studentSatisfaction: 4.6,
      };

      // Mettre à jour les stats pour l'affichage
      this.stats = {
        totalStudents: this.analytics.totalEnrollments,
        growthRate: this.analytics.growthRate,
        studentSatisfaction: this.analytics.studentSatisfaction,
        topPerformingCategory: this.analytics.topPerformingCategory,
      };
    } catch (error) {
      console.error('Erreur loadAnalytics:', error);
    }
  }

  // 🔍 Appliquer les filtres et le tri
  applyFiltersAndSort() {
    let filtered = [...this.popularCourses];

    // Filtre par catégorie
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(
        (course) => course.category === this.selectedCategory
      );
    }

    // Filtre par niveau
    if (this.selectedLevel !== 'all') {
      filtered = filtered.filter(
        (course) => course.level === this.selectedLevel
      );
    }

    // Tri
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (this.selectedSort) {
        case 'students':
          aValue = a.totalStudents;
          bValue = b.totalStudents;
          break;
        case 'rating':
          aValue = a.averageRating;
          bValue = b.averageRating;
          break;
        case 'completion':
          aValue = a.completionRate;
          bValue = b.completionRate;
          break;
        case 'revenue':
          aValue = a.totalRevenue;
          bValue = b.totalRevenue;
          break;
        case 'recent':
          aValue = a.createdAt;
          bValue = b.createdAt;
          break;
        default:
          aValue = a.totalStudents;
          bValue = b.totalStudents;
      }

      if (this.sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    this.popularCourses = filtered;
    this.totalItems = filtered.length;
    this.currentPage = 1;
  }

  // 📄 Pagination
  get paginatedCourses(): PopularCourse[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.popularCourses.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // ✅ Actions sur les cours
  viewCourse(courseId: number) {
    this.router.navigate(['/admin/courses/view', courseId]);
  }

  editCourse(courseId: number) {
    this.router.navigate(['/admin/courses/builder', courseId]);
  }

  toggleFeatured(courseId: number) {
    const course = this.popularCourses.find((c) => c.id === courseId);
    if (course) {
      course.featured = !course.featured;
      // Appel API pour mettre à jour
      console.log('Toggle featured:', courseId, course.featured);
    }
  }

  // 🎨 Utilitaires
  getRatingStars(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }

  getRatingClass(rating: number, star: number): string {
    if (star <= rating) {
      return 'fa-solid fa-star text-yellow-400';
    } else if (star - rating < 1) {
      return 'fa-solid fa-star-half-alt text-yellow-400';
    } else {
      return 'fa-regular fa-star text-gray-300';
    }
  }

  getTrendingBadgeClass(course: PopularCourse): string {
    if (course.trending) {
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }

  getFeaturedBadgeClass(course: PopularCourse): string {
    if (course.featured) {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }

  getCompletionRateClass(rate: number): string {
    if (rate >= 80) return 'text-green-600 dark:text-green-400';
    if (rate >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('fr-FR').format(num);
  }

  // Méthodes manquantes pour le template
  getEndItem(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
  }

  exportData() {
    // TODO: Implémenter l'export des données
    console.log('Export des données...');
  }

  // 📊 Données de test
  private generateMockPopularCourses(): PopularCourse[] {
    return [
      {
        id: 1,
        title: 'Arabe pour Débutants',
        description:
          "Apprenez les bases de l'arabe moderne standard avec une méthode progressive et interactive",
        category: 'langues',
        subcategory: 'arabe',
        level: 'debutant',
        instructor: 'Ahmed Benali',
        totalStudents: 1247,
        totalLessons: 24,
        averageRating: 4.8,
        totalRatings: 892,
        completionRate: 85.2,
        totalRevenue: 12470,
        createdAt: new Date('2024-01-15'),
        lastActivity: new Date('2024-01-25'),
        trending: true,
        featured: true,
      },
      {
        id: 2,
        title: 'Mathématiques Avancées',
        description:
          'Algèbre linéaire et calcul différentiel pour étudiants universitaires',
        category: 'mathematiques',
        subcategory: 'algebre',
        level: 'avance',
        instructor: 'Marie Dubois',
        totalStudents: 892,
        totalLessons: 32,
        averageRating: 4.6,
        totalRatings: 567,
        completionRate: 78.9,
        totalRevenue: 8920,
        createdAt: new Date('2024-01-10'),
        lastActivity: new Date('2024-01-23'),
        trending: true,
        featured: false,
      },
      {
        id: 3,
        title: 'Français Intermédiaire',
        description:
          'Perfectionnement en grammaire et expression écrite et orale',
        category: 'langues',
        subcategory: 'francais',
        level: 'intermediaire',
        instructor: 'Sophie Bernard',
        totalStudents: 756,
        totalLessons: 28,
        averageRating: 4.9,
        totalRatings: 634,
        completionRate: 82.1,
        totalRevenue: 7560,
        createdAt: new Date('2024-01-08'),
        lastActivity: new Date('2024-01-22'),
        trending: false,
        featured: true,
      },
      {
        id: 4,
        title: 'Physique Quantique',
        description:
          'Introduction aux principes fondamentaux de la mécanique quantique',
        category: 'sciences',
        subcategory: 'physique',
        level: 'avance',
        instructor: 'Pierre Martin',
        totalStudents: 634,
        totalLessons: 18,
        averageRating: 4.7,
        totalRatings: 445,
        completionRate: 71.3,
        totalRevenue: 6340,
        createdAt: new Date('2024-01-05'),
        lastActivity: new Date('2024-01-20'),
        trending: true,
        featured: false,
      },
      {
        id: 5,
        title: "Histoire de l'Art",
        description:
          'Découvrez les mouvements artistiques majeurs de la Renaissance à nos jours',
        category: 'histoire',
        subcategory: 'art',
        level: 'intermediaire',
        instructor: 'Claire Moreau',
        totalStudents: 523,
        totalLessons: 22,
        averageRating: 4.5,
        totalRatings: 389,
        completionRate: 76.8,
        totalRevenue: 5230,
        createdAt: new Date('2024-01-12'),
        lastActivity: new Date('2024-01-21'),
        trending: false,
        featured: false,
      },
      {
        id: 6,
        title: 'Géographie Mondiale',
        description: 'Exploration des continents, pays et cultures du monde',
        category: 'geographie',
        subcategory: 'monde',
        level: 'debutant',
        instructor: 'Jean Dupont',
        totalStudents: 445,
        totalLessons: 20,
        averageRating: 4.4,
        totalRatings: 312,
        completionRate: 79.2,
        totalRevenue: 4450,
        createdAt: new Date('2024-01-18'),
        lastActivity: new Date('2024-01-24'),
        trending: false,
        featured: false,
      },
    ];
  }
}
