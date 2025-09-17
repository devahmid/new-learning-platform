import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Category {
  id: number;
  name: string;
  description: string;
  imageUrl?: string;
  isActive: boolean;
  order: number;
  subcategories?: Subcategory[];
}

export interface Subcategory {
  id: number;
  name: string;
  description: string;
  categoryId: number;
  order: number;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  constructor(private http: HttpClient) {}

  // Récupérer toutes les catégories avec leurs sous-catégories
  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${environment.apiUrl}/categories`);
  }

  // Récupérer une catégorie par ID
  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${environment.apiUrl}/categories/${id}`);
  }

  // Récupérer toutes les sous-catégories
  getAllSubcategories(): Observable<Subcategory[]> {
    return this.http.get<Subcategory[]>(`${environment.apiUrl}/subcategories`);
  }

  // Récupérer les sous-catégories d'une catégorie
  getSubcategoriesByCategory(categoryId: number): Observable<Subcategory[]> {
    return this.http.get<Subcategory[]>(
      `${environment.apiUrl}/subcategories/category/${categoryId}`
    );
  }

  // Récupérer une sous-catégorie par ID
  getSubcategoryById(id: number): Observable<Subcategory> {
    return this.http.get<Subcategory>(
      `${environment.apiUrl}/subcategories/${id}`
    );
  }

  // Créer une nouvelle catégorie
  createCategory(category: Partial<Category>): Observable<Category> {
    return this.http.post<Category>(
      `${environment.apiUrl}/categories`,
      category
    );
  }

  // Créer une nouvelle sous-catégorie
  createSubcategory(
    subcategory: Partial<Subcategory>
  ): Observable<Subcategory> {
    return this.http.post<Subcategory>(
      `${environment.apiUrl}/subcategories`,
      subcategory
    );
  }
}
