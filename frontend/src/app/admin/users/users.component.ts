import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminStatsService, AdminStats } from '../../services/admin-stats.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {
  
  // Statistiques des utilisateurs
  stats: AdminStats | null = null;
  isLoading = true;
  error: string | null = null;

  userActions = [
    {
      icon: 'fa-solid fa-users',
      label: 'Tous les utilisateurs',
      desc: 'Consulter et gérer la liste complète des utilisateurs',
      path: 'list',
    },
    {
      icon: 'fa-solid fa-user-plus',
      label: 'Ajouter un utilisateur',
      desc: 'Créer un nouvel utilisateur (parent ou enfant)',
      path: 'ajout',
    },
    {
      icon: 'fa-solid fa-user-shield',
      label: 'Gestion des rôles',
      desc: 'Configurer les rôles et permissions des utilisateurs',
      path: 'settings/roles',
    },
    {
      icon: 'fa-solid fa-school',
      label: 'Classes d\'élèves',
      desc: 'Organiser les enfants par classes et niveaux',
      path: 'classes',
    },
    {
      icon: 'fa-solid fa-child',
      label: 'Modifier un enfant',
      desc: 'Éditer les informations d\'un enfant spécifique',
      path: 'children/1/edit',
    },
    {
      icon: 'fa-solid fa-user-friends',
      label: 'Modifier un parent',
      desc: 'Éditer les informations d\'un parent spécifique',
      path: 'parents/1/edit',
    },
  ];

  constructor(
    private router: Router,
    private adminStatsService: AdminStatsService
  ) { }

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.isLoading = true;
    this.error = null;
    
    this.adminStatsService.getAdminStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.isLoading = false;
        console.log('Statistiques chargées:', stats);
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des statistiques';
        this.isLoading = false;
        console.error('Erreur lors du chargement des statistiques:', err);
      }
    });
  }

  goTo(path: string) {
    const basePath = path.startsWith('settings') || path.startsWith('courses') || path.startsWith('stats')
      ? ['/admin', ...path.split('/')]
      : ['/admin/users', ...path.split('/')];

    this.router.navigate(basePath);
  }

  // Helper methods pour le template
  getGrowthColor(percentage: number): string {
    if (percentage > 0) return 'text-green-600 dark:text-green-400';
    if (percentage < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-500 dark:text-gray-400';
  }

  formatGrowthText(percentage: number): string {
    if (percentage === 0) return 'Stable';
    return `${percentage > 0 ? '+' : ''}${percentage}%`;
  }
}
