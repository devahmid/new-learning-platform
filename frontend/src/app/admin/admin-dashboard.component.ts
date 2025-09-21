import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  AdminService,
  DashboardStats,
  User,
  Course,
  Activity,
  Alert,
  PerformanceStats,
} from './admin.service';
import { Router } from '@angular/router';

// Interface pour les colonnes
interface Column {
  field: keyof User | keyof Course | 'actions';
  header: string;
  sortable?: boolean;
  sortDirection?: 'asc' | 'desc';
  type?: 'status' | 'date' | 'action' | 'number';
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  // Propriétés classiques pour la réactivité
  stats: DashboardStats = {
    totalUsers: 0,
    activeUsers: 0,
    totalCourses: 0,
    totalRevenue: 0,
    newUsersThisMonth: 0,
    courseCompletionRate: 0,
  };

  recentUsers: User[] = [];
  popularCourses: Course[] = [];
  recentActivities: Activity[] = [];
  systemAlerts: Alert[] = [];
  performanceStats: PerformanceStats | null = null;
  permissions: any = null;

  // États de chargement
  isLoading = false;
  isRefreshing = false;
  hasError = false;

  // État du thème
  isDarkMode = false;
  errorMessage = '';

  // Filtres et recherche
  searchTerm = '';
  selectedFilter = 'all';
  selectedTimeRange = '7d'; // 7d, 30d, 90d, 1y

  // Colonnes des tableaux avec tri et filtrage
  recentUsersColumns: Column[] = [
    {
      field: 'name',
      header: 'Nom',
      sortable: true,
      sortDirection: 'asc',
    },
    {
      field: 'email',
      header: 'Email',
      sortable: true,
      sortDirection: 'asc',
    },
    {
      field: 'role',
      header: 'Rôle',
      sortable: true,
      type: 'status',
      sortDirection: 'asc',
    },
    {
      field: 'createdAt',
      header: "Date d'inscription",
      sortable: true,
      type: 'date',
      sortDirection: 'desc',
    },
    {
      field: 'status',
      header: 'Statut',
      sortable: true,
      type: 'status',
      sortDirection: 'asc',
    },
    { field: 'actions', header: 'Actions', type: 'action' },
  ];

  popularCoursesColumns: Column[] = [
    {
      field: 'title',
      header: 'Titre',
      sortable: true,
      sortDirection: 'asc',
    },
    {
      field: 'subject',
      header: 'Matière',
      sortable: true,
      sortDirection: 'asc',
    },
    {
      field: 'enrollmentCount',
      header: 'Inscriptions',
      sortable: true,
      type: 'number',
      sortDirection: 'desc',
    },
    {
      field: 'completionRate',
      header: 'Taux de réussite',
      sortable: true,
      type: 'number',
      sortDirection: 'desc',
    },
    { field: 'actions', header: 'Actions', type: 'action' },
  ];

  // Actions pour les tableaux avec permissions
  userActions = [
    {
      label: 'Voir',
      icon: 'fa-solid fa-eye',
      type: 'info',
      action: 'view',
      permission: 'canViewUsers',
    },
    {
      label: 'Modifier',
      icon: 'fa-solid fa-edit',
      type: 'warning',
      action: 'edit',
      permission: 'canManageUsers',
    },
    {
      label: 'Supprimer',
      icon: 'fa-solid fa-trash',
      type: 'danger',
      action: 'delete',
      permission: 'canManageUsers',
    },
  ];

  courseActions = [
    {
      label: 'Voir',
      icon: 'fa-solid fa-eye',
      type: 'info',
      action: 'view',
      permission: 'canViewCourses',
    },
    {
      label: 'Modifier',
      icon: 'fa-solid fa-edit',
      type: 'warning',
      action: 'edit',
      permission: 'canManageCourses',
    },
    {
      label: 'Statistiques',
      icon: 'fa-solid fa-chart-bar',
      type: 'success',
      action: 'stats',
      permission: 'canViewStats',
    },
  ];

  // Actions principales avec permissions
  mainActions = [
    {
      label: 'Gestion des utilisateurs',
      icon: 'fa-solid fa-users-cog',
      type: 'success',
      route: '/admin/users',
      permission: 'canManageUsers',
    },
    {
      label: 'Créer un cours',
      icon: 'fa-solid fa-book-medical',
      type: 'primary',
      route: '/admin/courses',
      permission: 'canManageCourses',
    },
    {
      label: 'Gérer les exercices',
      icon: 'fa-solid fa-clipboard-list',
      type: 'warning',
      route: '/admin/exercises',
      permission: 'canManageCourses',
    },
    {
      label: 'Voir les statistiques',
      icon: 'fa-solid fa-chart-line',
      type: 'info',
      route: '/admin/stats',
      permission: 'canViewStats',
    },
    {
      label: 'Gérer les paramètres',
      icon: 'fa-solid fa-cog',
      type: 'secondary',
      route: '/admin/settings',
      permission: 'canManageSystem',
    },
  ];

  // Nouvelles fonctionnalités
  timeRangeOptions = [
    { value: '7d', label: '7 jours', icon: 'fa-solid fa-calendar-week' },
    { value: '30d', label: '30 jours', icon: 'fa-solid fa-calendar-alt' },
    { value: '90d', label: '3 mois', icon: 'fa-solid fa-calendar' },
    { value: '1y', label: '1 an', icon: 'fa-solid fa-calendar-day' },
  ];

  filterOptions = [
    { value: 'all', label: 'Tous', icon: 'fa-solid fa-filter' },
    { value: 'active', label: 'Actifs', icon: 'fa-solid fa-check-circle' },
    { value: 'inactive', label: 'Inactifs', icon: 'fa-solid fa-times-circle' },
    { value: 'pending', label: 'En attente', icon: 'fa-solid fa-clock' },
  ];

  // Méthodes pour les données filtrées
  get filteredUsers(): User[] {
    const users = this.recentUsers;
    const search = this.searchTerm.toLowerCase();
    const filter = this.selectedFilter;

    return users.filter((user) => {
      const matchesSearch =
        (user.name?.toLowerCase().includes(search) || false) ||
        (user.email?.toLowerCase().includes(search) || false);
      
      // Gérer le statut (NULL = 'pending' par défaut)
      const userStatus = user.status || 'pending';
      const matchesFilter = filter === 'all' || userStatus === filter;

      return matchesSearch && matchesFilter;
    });
  }

  get filteredCourses(): Course[] {
    const courses = this.popularCourses;
    const search = this.searchTerm.toLowerCase();

    return courses.filter(
      (course) =>
        (course.title?.toLowerCase().includes(search) || false) ||
        (course.subject?.toLowerCase().includes(search) || false)
    );
  }

  // Méthodes pour les statistiques calculées
  get totalRevenueFormatted(): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(this.stats.totalRevenue);
  }

  get completionRateFormatted(): string {
    return `${this.stats.courseCompletionRate}%`;
  }

  // Méthodes pour les alertes
  get activeAlerts(): Alert[] {
    return this.systemAlerts.filter((alert) => !alert.dismissed);
  }

  get criticalAlerts(): Alert[] {
    return this.activeAlerts.filter((alert) => alert.severity === 'critical');
  }

  constructor(private adminService: AdminService, private router: Router) {}

  ngOnInit() {
    this.loadAllData();
    this.checkUserPermissions();
    this.initTheme();
    this.subscribeToData();

    // Logique métier basée sur les données
    if (this.systemAlerts.length > 0) {
      console.log(`📊 ${this.systemAlerts.length} alertes actives`);
    }

    if (this.stats.totalUsers > 1000) {
      console.log('🎉 Plateau de 1000 utilisateurs atteint !');
    }
  }

  ngOnDestroy() {
    // Le service gère déjà le nettoyage
  }

  // Initialiser le thème
  private initTheme(): void {
    const savedTheme = localStorage.getItem('theme') || 'light';
    this.isDarkMode = savedTheme === 'dark';

    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }

  // Basculer le thème
  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;

    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }

    // Sauvegarder la préférence
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }

  // 🚀 Charger toutes les données
  loadAllData() {
    this.isLoading = true;
    this.hasError = false;

    // Charger les données en parallèle
    Promise.all([
      this.adminService.loadDashboardStats().toPromise(),
      this.adminService.loadRecentUsers().toPromise(),
      this.adminService.loadPopularCourses().toPromise(),
      this.adminService.loadRecentActivities().toPromise(),
      this.adminService.loadSystemAlerts().toPromise(),
      this.adminService.loadPerformanceStats().toPromise(),
    ])
      .then(() => {
        this.isLoading = false;
      })
      .catch((error) => {
        console.error('Erreur lors du chargement des données:', error);
        this.hasError = true;
        this.errorMessage = 'Erreur lors du chargement des données';
        this.isLoading = false;
      });
  }

  // 📊 S'abonner aux données du service
  subscribeToData() {
    // S'abonner aux statistiques
    this.adminService.stats$.subscribe(stats => {
      if (stats) {
        this.stats = stats;
      }
    });

    // S'abonner aux utilisateurs récents
    this.adminService.users$.subscribe(users => {
      this.recentUsers = users;
    });

    // S'abonner aux cours populaires
    this.adminService.courses$.subscribe(courses => {
      this.popularCourses = courses;
    });

    // S'abonner aux activités récentes
    this.adminService.activities$.subscribe(activities => {
      this.recentActivities = activities;
    });

    // S'abonner aux alertes système
    this.adminService.alerts$.subscribe(alerts => {
      this.systemAlerts = alerts;
    });

    // S'abonner aux statistiques de performance
    this.adminService.performance$.subscribe(performance => {
      this.performanceStats = performance;
    });
  }

  // 🔒 Vérifier les permissions utilisateur
  checkUserPermissions() {
    this.adminService.checkPermissions().subscribe({
      next: (permissions) => {
        this.permissions = permissions;
        console.log('Permissions vérifiées:', permissions);
      },
      error: (error) => {
        console.error('Erreur lors de la vérification des permissions:', error);
        this.permissions = {
          canManageUsers: false,
          canManageCourses: false,
          canViewStats: false,
          canManageSystem: false,
        };
      },
    });
  }

  // 🎯 Actions sur les utilisateurs
  onUserAction(action: any, user: User) {
    console.log('Action utilisateur:', action, user);

    if (!this.hasPermission(action.permission)) {
      this.showError('Permission insuffisante pour cette action');
      return;
    }

    switch (action.action) {
      case 'view':
        this.router.navigate(['/admin/users', user.id]);
        break;
      case 'edit':
        this.router.navigate(['/admin/users', user.id, 'edit']);
        break;
      case 'delete':
        this.confirmDeleteUser(user);
        break;
    }
  }

  // 📚 Actions sur les cours
  onCourseAction(action: any, course: Course) {

    if (!this.hasPermission(action.permission)) {
      this.showError('Permission insuffisante pour cette action');
      return;
    }

    switch (action.action) {
      case 'view':
        this.router.navigate(['/admin/courses', course.id]);
        break;
      case 'edit':
        this.router.navigate(['/admin/courses', course.id, 'edit']);
        break;
      case 'stats':
        this.router.navigate(['/admin/courses', course.id, 'stats']);
        break;
    }
  }

  // 🚀 Actions principales
  onMainActionClick(action: any) {

    if (!this.hasPermission(action.permission)) {
      this.showError('Permission insuffisante pour cette action');
      return;
    }

    this.router.navigate([action.route]);
  }

  // 👥 Clic sur un utilisateur
  onUserRowClick(user: User) {
    this.router.navigate(['/admin/users', user.id]);
  }

  // 📚 Clic sur un cours
  onCourseRowClick(course: Course) {
    this.router.navigate(['/admin/courses', course.id]);
  }

  // 🔍 Recherche
  onSearch() {
    console.log('Recherche:', this.searchTerm);
    // La recherche est automatique grâce aux computed properties
  }

  // 🎛️ Changement de filtre
  onFilterChange() {
    console.log('Filtre:', this.selectedFilter);
    // Le filtrage est automatique grâce aux computed properties
  }

  // 📅 Changement de période
  onTimeRangeChange(timeRange: string) {
    this.selectedTimeRange = timeRange;
    // Recharger les données pour la nouvelle période
    this.loadAllData();
  }

  // 🔄 Rafraîchir manuellement
  onRefresh() {
    this.isRefreshing = true;
    this.adminService.refreshDashboard().subscribe({
      next: () => {
        this.isRefreshing = false;
      },
      error: (error) => {
        this.isRefreshing = false;
        this.showError('Erreur lors du rafraîchissement');
        console.error('Erreur refresh:', error);
      },
    });
  }

  // 📊 Exporter les données
  onExport() {
    this.adminService.exportDashboardData().subscribe({
      next: () => {
        console.log('Export réussi');
      },
      error: (error) => {
        this.showError("Erreur lors de l'export");
        console.error('Erreur export:', error);
      },
    });
  }

  // 🚫 Fermer une alerte
  onDismissAlert(alert: Alert) {
    this.adminService.dismissAlert(alert.id).subscribe({
      next: () => {
        console.log('Alerte fermée:', alert.id);
      },
      error: (error) => {
        this.showError("Erreur lors de la fermeture de l'alerte");
        console.error('Erreur dismiss alert:', error);
      },
    });
  }

  // 🔒 Vérifier les permissions
  hasPermission(permission: string): boolean {
    const permissions = this.permissions;
    return permissions ? permissions[permission] : false;
  }

  // 🚨 Afficher une erreur
  showError(message: string) {
    this.hasError = true;
    this.errorMessage = message;

    // Masquer l'erreur après 5 secondes
    setTimeout(() => {
      this.hasError = false;
      this.errorMessage = '';
    }, 5000);
  }

  // 📈 Trier les colonnes
  onSort(column: Column) {
    if (!column.sortable) return;

    // Inverser la direction de tri
    column.sortDirection = column.sortDirection === 'asc' ? 'desc' : 'asc';

    // Trier les données
    const users = [...this.recentUsers];
    const courses = [...this.popularCourses];

    if (
      column.field === 'name' ||
      column.field === 'email' ||
      column.field === 'role' ||
      column.field === 'status'
    ) {
      users.sort((a, b) => {
        const aValue = a[column.field as keyof User];
        const bValue = b[column.field as keyof User];

        if (column.sortDirection === 'asc') {
          return String(aValue).localeCompare(String(bValue));
        } else {
          return String(bValue).localeCompare(String(aValue));
        }
      });
      this.recentUsers = users;
    }

    if (column.field === 'title' || column.field === 'subject') {
      courses.sort((a, b) => {
        const aValue = a[column.field as keyof Course];
        const bValue = b[column.field as keyof Course];

        if (column.sortDirection === 'asc') {
          return String(aValue).localeCompare(String(bValue));
        } else {
          return String(bValue).localeCompare(String(aValue));
        }
      });
      this.popularCourses = courses;
    }

    if (
      column.field === 'enrollmentCount' ||
      column.field === 'completionRate'
    ) {
      courses.sort((a, b) => {
        const aValue = a[column.field as keyof Course] as number;
        const bValue = b[column.field as keyof Course] as number;

        if (column.sortDirection === 'asc') {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      });
      this.popularCourses = courses;
    }
  }

  // 🗑️ Confirmer la suppression d'un utilisateur
  private confirmDeleteUser(user: User) {
    if (
      confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.name} ?`)
    ) {
      // Implémenter la suppression via l'API
      console.log('Suppression confirmée pour:', user.name);
    }
  }

  // 🔐 Naviguer vers la page de validation des utilisateurs
  navigateToValidation() {
    this.router.navigate(['/admin/users/validation']);
  }

  // 🏷️ Obtenir la classe CSS pour le badge de statut
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // 🏷️ Obtenir le libellé du statut
  getStatusLabel(status: string): string {
    switch (status) {
      case 'approved':
        return 'Approuvé';
      case 'pending':
        return 'En attente';
      case 'rejected':
        return 'Rejeté';
      default:
        return 'Inconnu';
    }
  }
}
