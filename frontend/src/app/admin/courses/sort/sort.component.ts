import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../admin.service';
import { CategoryService, Category } from '../../../services/category.service';
import { ClasseService } from '../../../services/classe.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ProgressBarModule } from 'primeng/progressbar';

interface Course {
  id: number;
  title: string;
  description: string;
  order: number;
  categoryId: number;
  classeId: number;
  status: string;
}

@Component({
  selector: 'app-sort',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastModule, ProgressBarModule],
  templateUrl: './sort.component.html',
  styleUrls: ['./sort.component.scss'],
  providers: [MessageService]
})
export class SortComponent implements OnInit {
  categories: Category[] = [];
  classes: any[] = [];
  courses: Course[] = [];
  filteredCourses: Course[] = [];
  
  selectedCategoryId: number | null = null;
  selectedClasseId: number | null = null;
  
  isLoading = false;
  isSaving = false;
  hasChanges = false;

  constructor(
    private adminService: AdminService,
    private categoryService: CategoryService,
    private classeService: ClasseService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    this.isLoading = true;
    try {
      // Charger les catégories et classes
      const [categoriesResponse, classesResponse] = await Promise.all([
        this.categoryService.getAllCategories().toPromise(),
        this.classeService.getAllClasses().toPromise()
      ]);
      
      // Gérer la structure de réponse de l'API
      this.categories = Array.isArray(categoriesResponse) ? categoriesResponse : ((categoriesResponse as any)?.data || []);
      this.classes = Array.isArray(classesResponse) ? classesResponse : ((classesResponse as any)?.data || []);
      
      // S'assurer que les tableaux sont bien des tableaux
      if (!Array.isArray(this.categories)) {
        this.categories = [];
      }
      if (!Array.isArray(this.classes)) {
        this.classes = [];
      }
      
      console.log('Catégories chargées:', this.categories);
      console.log('Classes chargées:', this.classes);
      
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Impossible de charger les données'
      });
    } finally {
      this.isLoading = false;
    }
  }

  async onCategoryChange() {
    if (!this.selectedCategoryId) {
      this.courses = [];
      this.filteredCourses = [];
      return;
    }

    this.isLoading = true;
    try {
      // Récupérer tous les cours depuis l'API existante
      const coursesResponse = await this.adminService.getAllCourses().toPromise();
      
      console.log('🔍 Réponse complète de getAllCourses:', coursesResponse);
      
      // Gérer la structure de réponse de l'API
      let allCourses = Array.isArray(coursesResponse) ? coursesResponse : ((coursesResponse as any)?.data || []);
      
      console.log('📚 Tous les cours extraits:', allCourses);
      console.log('📊 Type de allCourses:', typeof allCourses, 'Is Array:', Array.isArray(allCourses));
      
      // S'assurer que les cours sont bien un tableau
      if (!Array.isArray(allCourses)) {
        allCourses = [];
      }
      
      console.log('🎯 Catégorie sélectionnée:', this.selectedCategoryId);
      
      // Filtrer les cours par catégorie côté client
      this.courses = allCourses.filter((course: any) => {
        const courseCategoryId = parseInt(course.categoryId);
        const courseCategoryObjectId = course.category?.id ? parseInt(course.category.id) : null;
        const selectedCategoryIdNum = parseInt(this.selectedCategoryId!.toString());
        
        const matchesCategory = courseCategoryId === selectedCategoryIdNum || 
                               courseCategoryObjectId === selectedCategoryIdNum;
        
        console.log(`📖 Cours "${course.title}" - categoryId: ${course.categoryId} (${typeof course.categoryId}), category?.id: ${course.category?.id} (${typeof course.category?.id}), selected: ${this.selectedCategoryId} (${typeof this.selectedCategoryId}), matches: ${matchesCategory}`);
        return matchesCategory;
      });
      
      console.log('✅ Cours filtrés pour la catégorie:', this.courses);
      console.log('📈 Nombre de cours trouvés:', this.courses.length);
      
      // Filtrer par classe si sélectionnée
      this.filterCourses();
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement des cours:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Impossible de charger les cours'
      });
    } finally {
      this.isLoading = false;
    }
  }

  onClasseChange() {
    this.filterCourses();
  }

  private filterCourses() {
    console.log('🔄 Début de filterCourses()');
    console.log('📋 selectedCategoryId:', this.selectedCategoryId);
    console.log('📚 this.courses.length:', this.courses.length);
    
    if (!this.selectedCategoryId) {
      this.filteredCourses = [];
      console.log('❌ Pas de catégorie sélectionnée, filteredCourses vide');
      return;
    }

    // Les cours sont déjà filtrés par catégorie dans onCategoryChange
    this.filteredCourses = [...this.courses];
    console.log('📝 filteredCourses après copie:', this.filteredCourses.length);

    if (this.selectedClasseId) {
      console.log('🎓 Filtrage par classe:', this.selectedClasseId);
      // Filtrer par classe si sélectionnée
      this.filteredCourses = this.filteredCourses.filter((course: any) => {
        const courseClasseId = parseInt(course.classeId);
        const courseClasseObjectId = course.classe?.id ? parseInt(course.classe.id) : null;
        const selectedClasseIdNum = parseInt(this.selectedClasseId!.toString());
        
        const matchesClasse = courseClasseId === selectedClasseIdNum ||
                             courseClasseObjectId === selectedClasseIdNum;
        
        console.log(`📖 Cours "${course.title}" - classeId: ${course.classeId} (${typeof course.classeId}), classe?.id: ${course.classe?.id} (${typeof course.classe?.id}), selected: ${this.selectedClasseId} (${typeof this.selectedClasseId}), matches: ${matchesClasse}`);
        return matchesClasse;
      });
      console.log('📝 filteredCourses après filtrage classe:', this.filteredCourses.length);
    }

    // Trier par ordre actuel
    this.sortCoursesByOrder();
    console.log('✅ filterCourses terminé, filteredCourses.length:', this.filteredCourses.length);
  }

  private sortCoursesByOrder() {
    this.filteredCourses.sort((a, b) => {
      // Si les deux cours ont un ordre défini
      if (a.order && b.order) {
        return a.order - b.order;
      }
      
      // Si seul le cours A a un ordre défini, il vient en premier
      if (a.order && !b.order) {
        return -1;
      }
      
      // Si seul le cours B a un ordre défini, il vient en premier
      if (!a.order && b.order) {
        return 1;
      }
      
      // Si aucun des deux n'a d'ordre défini, trier par titre
      return (a.title || '').localeCompare(b.title || '');
    });
  }

  // Gestion du drag & drop
  onDragStart(event: DragEvent, course: Course) {
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', course.id.toString());
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
  }

  onDrop(event: DragEvent, targetCourse: Course) {
    event.preventDefault();
    
    const draggedCourseId = parseInt(event.dataTransfer!.getData('text/plain'));
    const draggedCourse = this.filteredCourses.find(c => c.id === draggedCourseId);
    
    if (!draggedCourse || draggedCourse.id === targetCourse.id) {
      return;
    }

    // Réorganiser les cours
    this.reorderCourses(draggedCourse, targetCourse);
    this.hasChanges = true;
  }

  private reorderCourses(draggedCourse: Course, targetCourse: Course) {
    const draggedIndex = this.filteredCourses.findIndex(c => c.id === draggedCourse.id);
    const targetIndex = this.filteredCourses.findIndex(c => c.id === targetCourse.id);
    
    // Retirer le cours déplacé
    this.filteredCourses.splice(draggedIndex, 1);
    
    // Insérer à la nouvelle position
    this.filteredCourses.splice(targetIndex, 0, draggedCourse);
    
    // Mettre à jour les ordres
    this.updateCourseOrders();
  }

  private updateCourseOrders() {
    this.filteredCourses.forEach((course, index) => {
      course.order = index + 1;
    });
  }

  // Tri automatique par titre
  sortByTitle() {
    this.filteredCourses.sort((a, b) => a.title.localeCompare(b.title));
    this.updateCourseOrders();
    this.hasChanges = true;
  }

  // Sauvegarder l'ordre
  async saveOrder() {
    if (!this.hasChanges) {
      this.messageService.add({
        severity: 'info',
        summary: 'Info',
        detail: 'Aucun changement à sauvegarder'
      });
      return;
    }

    this.isSaving = true;
    try {
      const orderData = this.filteredCourses.map(course => ({
        courseId: course.id,
        order: course.order
      }));

      await this.adminService.updateCoursesOrder(orderData).toPromise();
      
      this.hasChanges = false;
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Ordre des cours sauvegardé avec succès'
      });
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Impossible de sauvegarder l\'ordre des cours'
      });
    } finally {
      this.isSaving = false;
    }
  }

  // Annuler les changements
  cancelChanges() {
    this.filterCourses(); // Recharger l'ordre original
    this.hasChanges = false;
  }

  goBack() {
    this.router.navigate(['/admin/courses']);
  }
}
