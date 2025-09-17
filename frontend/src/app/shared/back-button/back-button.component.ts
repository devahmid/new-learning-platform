import { Component, Input, OnInit, inject } from '@angular/core';
import { Location, CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavigationService } from '../../services/navigation.service';

@Component({
  selector: 'app-back-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button (click)="goBack()" 
            class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 
                   hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 
                   rounded-lg transition-all duration-200 border border-gray-200 dark:border-gray-700 
                   hover:border-emerald-200 dark:hover:border-emerald-700">
      <i class="fa-solid fa-arrow-left"></i>
      <span>{{ buttonText }}</span>
    </button>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
  `]
})
export class BackButtonComponent implements OnInit {
  @Input() buttonText: string = 'Retour';
  @Input() useContextual: boolean = false;
  @Input() fallbackPath: string = '/matières';
  
  private location = inject(Location);
  private router = inject(Router);
  private navigationService = inject(NavigationService);
  
  ngOnInit() {
    // Auto-déterminer le texte du bouton si pas fourni
    if (this.buttonText === 'Retour') {
      this.buttonText = this.getContextualButtonText();
    }
  }
  
  goBack() {
    if (this.useContextual) {
      this.goBackContextual();
    } else {
      this.goBackGeneric();
    }
  }
  
  private goBackGeneric() {
    // Utilise l'historique du navigateur
    this.location.back();
  }
  
  private goBackContextual() {
    // Navigation contextuelle basée sur la pile de navigation
    const previousRoute = this.navigationService.goToPreviousLevel();
    
    if (previousRoute) {
      this.router.navigate([previousRoute]);
    } else {
      // Fallback vers la page de fallback
      this.router.navigate([this.fallbackPath]);
    }
  }
  
  private getContextualButtonText(): string {
    const currentPath = this.router.url;
    
    if (currentPath.includes('/lesson/')) {
      return 'Retour au cours';
    } else if (currentPath.includes('/cours/')) {
      return 'Retour aux matières';
    } else if (currentPath.includes('/matières/')) {
      return 'Retour aux matières';
    }
    
    return 'Retour';
  }
}
