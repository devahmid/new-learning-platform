import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../admin.service';

@Component({
  selector: 'app-subcategories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subcategories.component.html',
  styleUrl: './subcategories.component.scss'
})
export class SubcategoriesComponent implements OnInit {
  subcategories: any[] = [];
  categories: any[] = [];
  newSubcategory: any = { name: '', description: '', categoryId: null };
  editId: number | null = null;
  isLoading = false;
  isSubmitting = false;
  hasError = false;
  errorMessage = '';
  searchTerm = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadData();
  }

  async loadData() {
    await this.loadCategories();
    await this.loadSubcategories();
  }

  async loadCategories() {
    try {
      const categories = await this.adminService.getCategories().toPromise();
      this.categories = categories || [];
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
      this.categories = [];
    }
  }

  async loadSubcategories() {
    try {
      this.isLoading = true;
      this.hasError = false;
      const subcategories = await this.adminService.getSubcategories().toPromise();
      this.subcategories = subcategories || [];
      this.totalItems = this.subcategories.length;
    } catch (error) {
      console.error('Erreur API, fallback:', error);
      this.hasError = true;
      this.errorMessage = "Erreur lors du chargement depuis l'API";
      this.subcategories = [];
    } finally {
      this.isLoading = false;
    }
  }

  get filteredSubcategories(): any[] {
    if (!this.searchTerm) return this.subcategories;
    return this.subcategories.filter((s) =>
      s.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
      (s.categoryName && s.categoryName.toLowerCase().includes(this.searchTerm.toLowerCase()))
    );
  }

  get paginatedSubcategories(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredSubcategories.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredSubcategories.length / this.itemsPerPage);
  }

  changePage(page: number) {
    this.currentPage = page;
  }

  getEndItem(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.filteredSubcategories.length);
  }

  edit(subcategory: any) {
    this.newSubcategory = { 
      name: subcategory.name, 
      description: subcategory.description,
      categoryId: subcategory.categoryId
    };
    this.editId = subcategory.id;
  }

  reset() {
    this.newSubcategory = { name: '', description: '', categoryId: null };
    this.editId = null;
    this.hasError = false;
    this.errorMessage = '';
  }

  async save() {
    if (!this.newSubcategory.name.trim()) {
      this.hasError = true;
      this.errorMessage = 'Le nom de la sous-catégorie est requis';
      return;
    }
    if (!this.newSubcategory.categoryId) {
      this.hasError = true;
      this.errorMessage = 'La catégorie parente est requise';
      return;
    }
    
    try {
      this.isSubmitting = true;
      if (this.editId) {
        await this.adminService.updateSubcategory(this.editId, this.newSubcategory).toPromise();
      } else {
        await this.adminService.createSubcategory(this.newSubcategory).toPromise();
      }
      this.reset();
      await this.loadSubcategories();
    } catch (error) {
      this.hasError = true;
      this.errorMessage = 'Erreur lors de la sauvegarde';
    } finally {
      this.isSubmitting = false;
    }
  }

  async remove(subcategory: any) {
    if (!confirm(`Supprimer la sous-catégorie "${subcategory.name}" ?`)) return;
    try {
      await this.adminService.deleteSubcategory(subcategory.id).toPromise();
      await this.loadSubcategories();
    } catch (error) {
      this.hasError = true;
      this.errorMessage = 'Erreur lors de la suppression';
    }
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category?.name || 'Inconnue';
  }
}
