import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ChildContextService } from '../../_children-context/_children-context/child-context.service';
import { ParentService } from '../../_children-context/_children-context/parent.service';
import { ChildStatsService, ChildStats } from '../../services/child-stats.service';
import { User } from '../../models/user.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-no-children-info',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <main class="px-6 py-12">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">Choisissez votre enfant</h1>
          <p class="text-xl text-gray-600">Sélectionnez l'enfant pour lequel vous souhaitez voir les cours</p>
        </div>

        <!-- Loading state -->
        <div *ngIf="isLoading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p class="mt-4 text-gray-600">Chargement des enfants...</p>
        </div>

        <!-- Bouton Zoom principal -->
        <section class="mb-12" *ngIf="!isLoading">
          <div class="text-center">
            <button
              (click)="openZoom()"
              class="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-6 px-12 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl text-xl"
            >
              <i class="fa-solid fa-video mr-4 text-2xl"></i>
              <div class="text-left">
                <div class="text-2xl">🎥 Cours en direct sur Zoom</div>
                <div class="text-lg opacity-90">Rejoignez la session maintenant</div>
              </div>
              <i class="fa-solid fa-external-link-alt ml-4 text-xl"></i>
            </button>
          </div>
        </section>

        <!-- Children cards -->
        <section id="children-cards" class="mb-12" *ngIf="!isLoading && children.length > 0">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div 
              *ngFor="let child of children; let i = index"
              [class]="getCardClasses(i)"
              (click)="selectChild(child)"
            >
              <div class="p-8 text-center">
                <div class="relative mb-6">
                  <!-- Avatar avec initiales -->
                  <div 
                    class="w-24 h-24 rounded-full mx-auto flex items-center justify-center text-white text-2xl font-bold border-4"
                    [class]="getAvatarClasses(i)"
                  >
                    {{ getChildInitials(child) }}
                  </div>
                  <div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                    <span class="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-semibold">En ligne</span>
                  </div>
                </div>
                <h3 class="text-2xl font-bold text-gray-900 mb-2">{{ child.firstName }} {{ child.lastName }}</h3>
                <p class="text-gray-600 mb-4">{{ getChildAge(child) }} ans • {{ child.level?.name || 'Niveau non défini' }}</p>
                
                <div [class]="getProgressBarClasses(i)" class="rounded-xl p-4 mb-6">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium text-gray-700">Progression globale</span>
                    <span [class]="getProgressTextClasses(i)" class="text-sm font-bold">{{ getChildProgress(child) }}%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-3">
                    <div [class]="getProgressBarColorClasses(i)" class="h-3 rounded-full" [style.width.%]="getChildProgress(child)"></div>
                  </div>
                </div>

                <div class="flex justify-between text-center mb-6">
                  <div>
                    <div class="text-2xl font-bold text-orange-600">{{ getChildPoints(child) }}</div>
                    <div class="text-xs text-gray-600">Points</div>
                  </div>
                  <div>
                    <div class="text-2xl font-bold text-green-600">{{ getChildBadges(child) }}</div>
                    <div class="text-xs text-gray-600">Badges</div>
                  </div>
                  <div>
                    <div class="text-2xl font-bold text-purple-600">{{ getChildSubjects(child) }}</div>
                    <div class="text-xs text-gray-600">Matières</div>
                  </div>
                </div>

                <button [class]="getButtonClasses(i)" class="w-full text-white font-semibold py-3 px-6 rounded-xl transition-colors">
                  <i class="fas fa-play mr-2"></i>Continuer l'apprentissage
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- No children message -->
        <div *ngIf="!isLoading && children.length === 0" class="text-center py-12">
          <div class="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
            <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fa-solid fa-child text-3xl text-gray-400"></i>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Aucun enfant enregistré</h3>
            <p class="text-gray-600 mb-6">Pour accéder aux matières, vous devez ajouter un enfant à votre compte.</p>
            
            <!-- Bouton Zoom -->
            <div class="mb-6">
              <button
                (click)="openZoom()"
                class="inline-flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <i class="fa-solid fa-video mr-3 text-xl"></i>
                <div class="text-left">
                  <div class="text-lg">Rejoindre le cours en direct</div>
                  <div class="text-sm opacity-90">Cliquez pour ouvrir Zoom</div>
                </div>
                <i class="fa-solid fa-external-link-alt ml-3"></i>
              </button>
            </div>
            
            <button
              routerLink="/mon-compte"
              class="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              <i class="fa-solid fa-user-plus mr-2"></i>Ajouter un enfant
            </button>
          </div>
        </div>

        <!-- Add child section -->
        <section id="add-child" class="text-center" *ngIf="!isLoading">
          <div class="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto border-2 border-dashed border-gray-300">
            <div class="mb-6">
              <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-plus text-3xl text-gray-400"></i>
              </div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">Ajouter un enfant</h3>
              <p class="text-gray-600">Créez un profil pour un nouvel enfant</p>
            </div>
            
            <!-- Bouton Zoom -->
            <div class="mb-6">
              <button
                (click)="openZoom()"
                class="inline-flex items-center justify-center w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <i class="fa-solid fa-video mr-3 text-xl"></i>
                <div class="text-left">
                  <div class="text-lg">Cours en direct</div>
                  <div class="text-sm opacity-90">Rejoindre Zoom maintenant</div>
                </div>
                <i class="fa-solid fa-external-link-alt ml-3"></i>
              </button>
            </div>
            
            <button 
              routerLink="/mon-compte"
              class="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              <i class="fas fa-user-plus mr-2"></i>Nouveau profil
            </button>
          </div>
        </section>
      </div>
    </main>
  `,
  styles: [],
})
export class NoChildrenInfoComponent implements OnInit {
  private childContext = inject(ChildContextService);
  private parentService = inject(ParentService);
  private childStatsService = inject(ChildStatsService);
  private router = inject(Router);
  
  children: User[] = [];
  childrenStats: Map<number, ChildStats> = new Map();
  isLoading = true;
  
  // Lien Zoom depuis l'environnement
  zoomLink = environment.zoomLink;

  // Méthode pour ouvrir Zoom avec des paramètres optimisés
  openZoom() {
    window.open(this.zoomLink, '_blank', 'noopener,noreferrer,width=1200,height=800,scrollbars=yes,resizable=yes');
  }

  ngOnInit() {
    this.loadChildren();
    
    // Ne plus rediriger automatiquement, toujours passer par la sélection
    // Même si un enfant est sélectionné, laisser l'utilisateur choisir
  }

  loadChildren() {
    this.isLoading = true;
    this.parentService.getChildrenOfLoggedInParent().subscribe({
      next: (children) => {
        this.children = children || [];
        
        // Charger les statistiques des enfants
        this.loadChildrenStats();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des enfants:', err);
        this.children = [];
        this.isLoading = false;
      }
    });
  }

  loadChildrenStats() {
    if (this.children.length === 0) {
      this.isLoading = false;
      return;
    }

    this.childStatsService.getChildrenStats().subscribe({
      next: (stats) => {
        // Créer une map des statistiques par ID d'enfant
        this.childrenStats.clear();
        stats.forEach(stat => {
          this.childrenStats.set(stat.id, stat);
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des statistiques:', err);
        // Continuer sans les statistiques
        this.isLoading = false;
      }
    });
  }

  selectChild(child: User) {
    this.childContext.setSelectedChild(child);
    this.router.navigate(['/matières']);
  }

  getChildInitials(child: User): string {
    const firstName = child.firstName || '';
    const lastName = child.lastName || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  }

  getAvatarClasses(index: number): string {
    const colorSchemes = [
      'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-200',
      'bg-gradient-to-br from-green-500 to-green-600 border-green-200',
      'bg-gradient-to-br from-purple-500 to-purple-600 border-purple-200',
      'bg-gradient-to-br from-orange-500 to-orange-600 border-orange-200',
      'bg-gradient-to-br from-pink-500 to-pink-600 border-pink-200'
    ];
    return colorSchemes[index % colorSchemes.length];
  }

  getChildAge(child: User): number {
    if (!child.dateOfBirth) return 8;
    const birthDate = new Date(child.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  getChildProgress(child: User): number {
    // Utiliser les vraies statistiques si disponibles
    const stats = this.childrenStats.get(child.id);
    if (stats) {
      return this.childStatsService.calculateProgress(stats);
    }
    
    // Si pas de données, afficher 0
    return 0;
  }

  getChildPoints(child: User): number {
    // Utiliser les vraies statistiques si disponibles
    const stats = this.childrenStats.get(child.id);
    if (stats) {
      return this.childStatsService.calculatePoints(stats);
    }
    
    // Si pas de données, afficher 0
    return 0;
  }

  getChildBadges(child: User): number {
    // Utiliser les vraies statistiques si disponibles
    const stats = this.childrenStats.get(child.id);
    if (stats) {
      return this.childStatsService.calculateBadges(stats);
    }
    
    // Si pas de données, afficher 0
    return 0;
  }

  getChildSubjects(child: User): number {
    // Utiliser les vraies statistiques si disponibles
    const stats = this.childrenStats.get(child.id);
    if (stats) {
      return stats.subjects;
    }
    
    // Si pas de données, afficher 0
    return 0;
  }

  getCardClasses(index: number): string {
    const colorSchemes = [
      'bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-4 border-blue-200 hover:border-blue-400 overflow-hidden',
      'bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-4 border-green-200 hover:border-green-400 overflow-hidden',
      'bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-4 border-purple-200 hover:border-purple-400 overflow-hidden',
      'bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-4 border-orange-200 hover:border-orange-400 overflow-hidden',
      'bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-4 border-pink-200 hover:border-pink-400 overflow-hidden'
    ];
    return colorSchemes[index % colorSchemes.length];
  }

  getProgressBarClasses(index: number): string {
    const colorSchemes = [
      'bg-blue-50',
      'bg-green-50',
      'bg-purple-50',
      'bg-orange-50',
      'bg-pink-50'
    ];
    return colorSchemes[index % colorSchemes.length];
  }

  getProgressTextClasses(index: number): string {
    const colorSchemes = [
      'text-blue-600',
      'text-green-600',
      'text-purple-600',
      'text-orange-600',
      'text-pink-600'
    ];
    return colorSchemes[index % colorSchemes.length];
  }

  getProgressBarColorClasses(index: number): string {
    const colorSchemes = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500'
    ];
    return colorSchemes[index % colorSchemes.length];
  }

  getButtonClasses(index: number): string {
    const colorSchemes = [
      'bg-blue-500 hover:bg-blue-600',
      'bg-green-500 hover:bg-green-600',
      'bg-purple-500 hover:bg-purple-600',
      'bg-orange-500 hover:bg-orange-600',
      'bg-pink-500 hover:bg-pink-600'
    ];
    return colorSchemes[index % colorSchemes.length];
  }
}
