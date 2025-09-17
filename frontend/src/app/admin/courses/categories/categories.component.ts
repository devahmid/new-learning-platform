import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../admin.service';

@Component({
    selector: 'app-categories',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './categories.component.html',
    styleUrl: './categories.component.scss'
})
export class CategoriesComponent implements OnInit {
  categories: any[] = [];
  newCategory: any = { name: '', description: '' };
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
    this.loadCategories();
  }

  async loadCategories() {
    try {
      this.isLoading = true;
      this.hasError = false;
      const categories = await this.adminService.getCategories().toPromise();
      this.categories = categories || [];
      this.totalItems = this.categories.length;
    } catch (error) {
      console.error('Erreur API, fallback:', error);
      this.hasError = true;
      this.errorMessage = "Erreur lors du chargement depuis l'API";
      this.categories = [];
    } finally {
      this.isLoading = false;
    }
  }

  get filteredCategories(): any[] {
    if (!this.searchTerm) return this.categories;
    return this.categories.filter((c) =>
      c.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(this.searchTerm.toLowerCase()))
    );
  }

  get paginatedCategories(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredCategories.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredCategories.length / this.itemsPerPage);
  }

  changePage(page: number) {
    this.currentPage = page;
  }

  getEndItem(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.filteredCategories.length);
  }

  edit(category: any) {
    this.newCategory = { name: category.name, description: category.description };
    this.editId = category.id;
  }

  reset() {
    this.newCategory = { name: '', description: '' };
    this.editId = null;
    this.hasError = false;
    this.errorMessage = '';
  }

  async save() {
    if (!this.newCategory.name.trim()) {
      this.hasError = true;
      this.errorMessage = 'Le nom de la catégorie est requis';
      return;
    }
    try {
      this.isSubmitting = true;
      if (this.editId) {
        await this.adminService.updateCategory(this.editId, this.newCategory).toPromise();
      } else {
        await this.adminService.createCategory(this.newCategory).toPromise();
      }
      this.reset();
      await this.loadCategories();
    } catch (error) {
      this.hasError = true;
      this.errorMessage = 'Erreur lors de la sauvegarde';
    } finally {
      this.isSubmitting = false;
    }
  }

  async remove(category: any) {
    if (!confirm(`Supprimer la catégorie "${category.name}" ?`)) return;
    try {
      await this.adminService.deleteCategory(category.id).toPromise();
      await this.loadCategories();
    } catch (error) {
      this.hasError = true;
      this.errorMessage = 'Erreur lors de la suppression';
    }
  }
}
