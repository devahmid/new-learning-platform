import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../admin.service';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.scss',
})
export class CoursesComponent implements OnInit {
  coursList = [
    {
      icon: 'fa-solid fa-book',
      label: 'Tous les cours',
      desc: 'Voir tous les cours disponibles',
      path: 'liste',
      color: 'bg-blue-500',
      count: 0, // Sera mis à jour avec les données réelles
    },
    {
      icon: 'fa-solid fa-plus-circle',
      label: 'Ajouter un cours',
      desc: 'Créer un nouveau cours avec leçons et quiz',
      path: 'ajout',
      color: 'bg-green-500',
      count: 0, // Sera mis à jour avec les données réelles
    },
    {
      icon: 'fa-solid fa-sort',
      label: 'Trier les cours',
      desc: 'Réorganiser l\'ordre d\'affichage des cours par catégorie',
      path: 'sort',
      color: 'bg-indigo-500',
      count: 0, // Sera mis à jour avec les données réelles
    },
    {
      icon: 'fa-solid fa-star',
      label: 'Cours populaires',
      desc: 'Top des cours les plus suivis',
      path: 'populaires',
      color: 'bg-yellow-500',
      count: 0, // Sera mis à jour avec les données réelles
    },
    {
      icon: 'fa-solid fa-check-circle',
      label: 'Cours terminés',
      desc: 'Voir les cours complétés',
      path: 'termines',
      color: 'bg-purple-500',
      count: 0, // Sera mis à jour avec les données réelles
    },

    // Admin tools
    {
      icon: 'fa-solid fa-tags',
      label: 'Catégories',
      desc: 'Gérer les catégories de cours',
      path: 'categories',
      color: 'bg-indigo-500',
      count: 0, // Sera mis à jour avec les données réelles
    },
    {
      icon: 'fa-solid fa-bookmark',
      label: 'Sous-catégories',
      desc: 'Gérer les sous-catégories liées aux catégories',
      path: 'subcategories',
      color: 'bg-purple-500',
      count: 0, // Sera mis à jour avec les données réelles
    },
    {
      icon: 'fa-solid fa-layer-group',
      label: 'Niveaux',
      desc: 'Gérer les niveaux de difficulté',
      path: 'niveaux',
      color: 'bg-pink-500',
      count: 0, // Sera mis à jour avec les données réelles
    },
    {
      icon: 'fa-solid fa-play-circle',
      label: 'Leçons',
      desc: 'Ajouter ou modifier des leçons',
      path: 'lessons',
      color: 'bg-teal-500',
      count: 0, // Sera mis à jour avec les données réelles
    },
    {
      icon: 'fa-solid fa-question-circle',
      label: 'Quiz',
      desc: 'Créer ou gérer les quiz',
      path: 'quiz',
      color: 'bg-orange-500',
      count: 0, // Sera mis à jour avec les données réelles
    },
    {
      icon: 'fa-solid fa-users',
      label: 'Inscriptions',
      desc: 'Voir les utilisateurs inscrits',
      path: 'inscriptions',
      color: 'bg-red-500',
      count: 0, // Sera mis à jour avec les données réelles
    },
    {
      icon: 'fa-solid fa-clipboard-question',
      label: 'Questions',
      desc: 'Gérer les questions des quiz',
      path: 'questions',
      color: 'bg-cyan-500',
      count: 0, // Sera mis à jour avec les données réelles
    },
    {
      icon: 'fa-solid fa-comments',
      label: 'Réponses',
      desc: 'Réponses possibles aux questions',
      path: 'answers',
      color: 'bg-lime-500',
      count: 0, // Sera mis à jour avec les données réelles
    },
    {
      icon: 'fa-solid fa-chart-line',
      label: 'Résultats',
      desc: 'Résultats des élèves aux quiz',
      path: 'results',
      color: 'bg-emerald-500',
      count: 0, // Sera mis à jour avec les données réelles
    },
  ];

  stats = {
    totalCourses: 0,
    activeCourses: 0,
    totalLessons: 0,
    totalStudents: 0,
  };

  isLoading = false;

  constructor(public router: Router, private adminService: AdminService) {}

  ngOnInit() {
    this.loadStats();
  }

  goTo(path: string) {
    this.router.navigate(['/admin/courses', path]);
  }

  private async loadStats() {
    try {
      this.isLoading = true;
      
      // Charger les statistiques réelles depuis l'API (seulement les méthodes disponibles)
      const [courses, categories, subcategories, levels] = await Promise.all([
        this.adminService.getAllCourses().toPromise().catch(() => []),
        this.adminService.getCategories().toPromise().catch(() => []),
        this.adminService.getSubcategories().toPromise().catch(() => []),
        this.adminService.getLevels().toPromise().catch(() => [])
      ]);

      // Calculer les statistiques réelles
      const totalCourses = courses?.length || 0;
      const activeCourses = courses?.filter((c: any) => c.status === 'published')?.length || 0;
      const totalLessons = courses?.reduce((sum: number, course: any) => sum + (course.lessons?.length || 0), 0) || 0;
      const totalStudents = courses?.reduce((sum: number, course: any) => sum + (course.enrollments?.length || 0), 0) || 0;

      this.stats = {
        totalCourses,
        activeCourses,
        totalLessons,
        totalStudents,
      };

      // Mettre à jour les compteurs des actions
      this.updateActionCounts({
        courses,
        categories,
        subcategories,
        levels
      });

    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error);
      // En cas d'erreur, afficher 0
      this.stats = {
        totalCourses: 0,
        activeCourses: 0,
        totalLessons: 0,
        totalStudents: 0,
      };
      this.updateActionCounts({});
    } finally {
      this.isLoading = false;
    }
  }

  private updateActionCounts(data: any) {
    // Mettre à jour les compteurs des actions avec les données réelles
    this.coursList[0].count = data.courses?.length || 0; // Tous les cours
    this.coursList[1].count = 0; // Ajouter un cours (action, pas de count)
    this.coursList[2].count = data.courses?.filter((c: any) => c.status === 'published')?.length || 0; // Cours populaires
    this.coursList[3].count = data.courses?.filter((c: any) => c.status === 'completed')?.length || 0; // Cours terminés
    this.coursList[4].count = data.categories?.length || 0; // Catégories
    this.coursList[5].count = data.subcategories?.length || 0; // Sous-catégories
    this.coursList[6].count = data.levels?.length || 0; // Niveaux
    this.coursList[7].count = data.courses?.reduce((sum: number, course: any) => sum + (course.lessons?.length || 0), 0) || 0; // Leçons (calculées depuis les cours)
    this.coursList[8].count = 0; // Quiz (pas de données disponibles)
    this.coursList[9].count = data.courses?.reduce((sum: number, course: any) => sum + (course.enrollments?.length || 0), 0) || 0; // Inscriptions
    this.coursList[10].count = 0; // Questions (pas de données disponibles)
    this.coursList[11].count = 0; // Réponses (pas de données disponibles)
    this.coursList[12].count = 0; // Résultats (pas de données disponibles)
  }
}
