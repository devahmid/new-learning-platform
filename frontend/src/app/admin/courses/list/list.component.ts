import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../admin.service';

interface Course {
  id: number;
  title: string;
  description: string;
  category?: string;
  subcategory?: string;
  level?: string;
  instructor?: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  totalLessons: number;
  totalStudents: number;
  averageRating: number;
}

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ListComponent implements OnInit, OnDestroy {
  courses: Course[] = [];
  filteredCourses: Course[] = [];
  isLoading = false;
  hasError = false;
  errorMessage = '';
  searchTerm = '';
  selectedStatus = 'all';
  selectedCategory = 'all';
  selectedLevel = 'all';

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  // Sorting
  sortField = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Bulk actions
  selectedCourses: number[] = [];
  isBulkActionMode = false;

  // Filter options
  statusOptions = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'draft', label: 'Brouillon' },
    { value: 'published', label: 'Publié' },
    { value: 'archived', label: 'Archivé' },
  ];

  categoryOptions = [
    { value: 'all', label: 'Toutes les catégories' },
    { value: 'langues', label: 'Langues' },
    { value: 'mathematiques', label: 'Mathématiques' },
    { value: 'sciences', label: 'Sciences' },
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
    { value: 'title', label: 'Titre' },
    { value: 'createdAt', label: 'Date de création' },
    { value: 'status', label: 'Statut' },
    { value: 'totalStudents', label: "Nombre d'élèves" },
    { value: 'averageRating', label: 'Note moyenne' },
  ];

  // Computed properties for status counts
  get publishedCount(): number {
    return this.courses.filter((c) => c.status === 'published').length;
  }

  get draftCount(): number {
    return this.courses.filter((c) => c.status === 'draft').length;
  }

  get archivedCount(): number {
    return this.courses.filter((c) => c.status === 'archived').length;
  }

  constructor(private adminService: AdminService, public router: Router) {}

  ngOnInit() {
    this.loadCourses();
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  async loadCourses() {
    try {
      this.isLoading = true;
      this.hasError = false;

      // Charger les cours depuis l'API
      const courses = await this.adminService.getAllCourses().toPromise();

      // Transformer les données pour correspondre à l'interface Course du composant
      this.courses =
        courses?.map((course) => ({
          id: course.id,
          title: course.title,
          description: course.description,
          category: course.category?.name || 'Non définie',
          subcategory: course.subcategory?.name || 'Non définie',
          level: course.level?.name || 'Non défini',
          instructor: course.instructor?.name || 'Non défini',
          status: course.status || 'draft',
          createdAt: new Date(course.createdAt),
          updatedAt: new Date(course.updatedAt),
          totalLessons: course.lessons?.length || 0,
          totalStudents: course.enrollments?.length || 0,
          averageRating: course.averageRating || 0,
        })) || [];

      this.filteredCourses = [...this.courses];
      this.totalItems = this.courses.length;
      this.applyFilters();
    } catch (error) {
      console.error('Erreur API, aucune donnée disponible:', error);
      // Pas de données disponibles - afficher 0
      this.courses = [];
      this.filteredCourses = [];
      this.totalItems = 0;
      this.applyFilters();

      this.hasError = true;
      this.errorMessage =
        "Erreur lors du chargement depuis l'API, utilisation des données par défaut";
    } finally {
      this.isLoading = false;
    }
  }

  applyFilters() {
    let filtered = [...this.courses];

    // Filtre par recherche
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(term) ||
          course.description.toLowerCase().includes(term)
      );
    }

    // Filtre par statut
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(
        (course) => course.status === this.selectedStatus
      );
    }

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

    this.filteredCourses = filtered;
    this.totalItems = filtered.length;
    this.currentPage = 1;
    this.sortCourses();
  }

  sortCourses() {
    this.filteredCourses.sort((a, b) => {
      let aValue: any = a[this.sortField as keyof Course];
      let bValue: any = b[this.sortField as keyof Course];

      // Handle undefined values
      if (aValue === undefined) aValue = '';
      if (bValue === undefined) bValue = '';

      // Handle dates
      if (aValue instanceof Date && bValue instanceof Date) {
        aValue = aValue.getTime();
        bValue = bValue.getTime();
      }

      // Handle strings
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get paginatedCourses(): Course[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredCourses.slice(start, end);
  }

  getEndItem(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
  }

  onSort(field: string) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.sortCourses();
  }

  editCourse(courseId: number) {
    this.router.navigate(['/admin/courses/edit', courseId]);
  }

  viewCourse(courseId: number) {
    this.router.navigate(['/admin/courses/view', courseId]);
  }

  async deleteCourse(courseId: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
      try {
        // Appel API pour supprimer le cours
        await this.adminService.deleteCourse(courseId).toPromise();

        // Supprimer de la liste locale
        this.courses = this.courses.filter((c) => c.id !== courseId);
        this.applyFilters();

        console.log('Cours supprimé avec succès');
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression du cours');
      }
    }
  }

  toggleCourseSelection(courseId: number) {
    const index = this.selectedCourses.indexOf(courseId);
    if (index > -1) {
      this.selectedCourses.splice(index, 1);
    } else {
      this.selectedCourses.push(courseId);
    }
    this.isBulkActionMode = this.selectedCourses.length > 0;
  }

  selectAllCourses() {
    if (this.selectedCourses.length === this.paginatedCourses.length) {
      this.selectedCourses = [];
    } else {
      this.selectedCourses = this.paginatedCourses.map((c) => c.id);
    }
    this.isBulkActionMode = this.selectedCourses.length > 0;
  }

  async bulkDelete() {
    if (
      confirm(
        `Êtes-vous sûr de vouloir supprimer ${this.selectedCourses.length} cours ?`
      )
    ) {
      try {
        // Appel API pour suppression en masse
        const deletePromises = this.selectedCourses.map((courseId) =>
          this.adminService.deleteCourse(courseId).toPromise()
        );

        await Promise.all(deletePromises);

        // Supprimer de la liste locale
        this.courses = this.courses.filter(
          (c) => !this.selectedCourses.includes(c.id)
        );
        this.selectedCourses = [];
        this.isBulkActionMode = false;
        this.applyFilters();

        console.log('Cours supprimés en masse avec succès');
      } catch (error) {
        console.error('Erreur lors de la suppression en masse:', error);
        alert('Erreur lors de la suppression en masse');
      }
    }
  }

  async bulkPublish() {
    try {
      // Appel API pour publication en masse
      const updatePromises = this.selectedCourses.map((courseId) => {
        const course = this.courses.find((c) => c.id === courseId);
        if (course) {
          return this.adminService
            .updateCourse(courseId, { ...course, status: 'published' })
            .toPromise();
        }
        return Promise.resolve();
      });

      await Promise.all(updatePromises);

      // Mettre à jour la liste locale
      this.courses.forEach((course) => {
        if (this.selectedCourses.includes(course.id)) {
          course.status = 'published';
        }
      });
      this.selectedCourses = [];
      this.isBulkActionMode = false;
      this.applyFilters();

      console.log('Cours publiés en masse avec succès');
    } catch (error) {
      console.error('Erreur lors de la publication en masse:', error);
      alert('Erreur lors de la publication en masse');
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  }

  getStatusLabel(status: string): string {
    console.log('status', status);
    switch (status) {
      case 'published':
        return 'Publié';
      case 'draft':
        return 'Brouillon';
      case 'archived':
        return 'Archivé';
      default:
        return status;
    }
  }

  private generateMockCourses(): Course[] {
    return [
      {
        id: 1,
        title: 'Arabe pour Débutants',
        description: "Apprenez les bases de l'arabe moderne standard",
        category: 'langues',
        subcategory: 'arabe',
        level: 'debutant',
        instructor: 'Dr. Ahmed Hassan',
        status: 'published',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-20'),
        totalLessons: 12,
        totalStudents: 45,
        averageRating: 4.5,
      },
      {
        id: 2,
        title: 'Mathématiques Avancées',
        description: 'Algèbre linéaire et calcul différentiel',
        category: 'mathematiques',
        subcategory: 'algebre',
        level: 'avance',
        instructor: 'Prof. Marie Dubois',
        status: 'draft',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-18'),
        totalLessons: 20,
        totalStudents: 0,
        averageRating: 0,
      },
      {
        id: 3,
        title: "Histoire de l'Art",
        description: 'Découvrez les mouvements artistiques majeurs',
        category: 'histoire',
        subcategory: 'art',
        level: 'intermediaire',
        instructor: 'Dr. Jean Martin',
        status: 'published',
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-22'),
        totalLessons: 15,
        totalStudents: 32,
        averageRating: 4.2,
      },
    ];
  }
}
