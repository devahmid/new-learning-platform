import { Injectable, signal } from '@angular/core';

export interface BreadcrumbItem {
  label: string;
  path: string;
  icon?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private navigationStack: string[] = [];
  private breadcrumb = signal<BreadcrumbItem[]>([]);
  private currentPath = signal<string>('');
  
  // Gestion de la pile de navigation
  pushRoute(route: string) {
    this.navigationStack.push(route);
    this.currentPath.set(route);
  }
  
  popRoute(): string | null {
    const route = this.navigationStack.pop();
    if (route) {
      this.currentPath.set(this.navigationStack[this.navigationStack.length - 1] || '');
    }
    return route || null;
  }
  
  getCurrentContext(): string {
    return this.navigationStack[this.navigationStack.length - 1] || '';
  }
  
  getNavigationStack(): string[] {
    return [...this.navigationStack];
  }
  
  // Gestion du breadcrumb
  updateBreadcrumb(breadcrumb: BreadcrumbItem[]) {
    this.breadcrumb.set(breadcrumb);
  }
  
  getBreadcrumb() {
    return this.breadcrumb.asReadonly();
  }
  
  // Navigation contextuelle
  goToPreviousLevel(): string | null {
    if (this.navigationStack.length > 1) {
      return this.popRoute();
    }
    return null;
  }
  
  // Navigation par type de page
  getBreadcrumbForPath(path: string): BreadcrumbItem[] {
    const segments = path.split('/').filter(segment => segment);
    const breadcrumb: BreadcrumbItem[] = [];
    
    // Page d'accueil
    if (segments.length === 0) {
      return [{ label: 'Accueil', path: '/', icon: 'fa-home' }];
    }
    
    // Page matières
    if (segments[0] === 'matières') {
      breadcrumb.push({ label: 'Matières', path: '/matières', icon: 'fa-book' });
      
      // Matière spécifique
      if (segments[1]) {
        const subjectName = this.getSubjectName(segments[1]);
        breadcrumb.push({ 
          label: subjectName, 
          path: `/matières/${segments[1]}`, 
          icon: this.getSubjectIcon(segments[1]) 
        });
        
        // Niveau spécifique
        if (segments[2]) {
          breadcrumb.push({ 
            label: `Niveau ${segments[2]}`, 
            path: `/cours/${segments[1]}/${segments[2]}`, 
            icon: 'fa-graduation-cap' 
          });
          
          // Cours spécifique
          if (segments[3]) {
            breadcrumb.push({ 
              label: `Cours ${segments[3]}`, 
              path: `/cours/${segments[1]}/${segments[2]}/${segments[3]}`, 
              icon: 'fa-book-open' 
            });
            
            // Leçon spécifique
            if (segments[4] === 'lesson' && segments[5]) {
              breadcrumb.push({ 
                label: `Leçon ${segments[5]}`, 
                path: `/cours/${segments[1]}/${segments[2]}/${segments[3]}/lesson/${segments[5]}`, 
                icon: 'fa-play-circle' 
              });
            }
          }
        }
      }
    }
    
    return breadcrumb;
  }
  
  private getSubjectName(subject: string): string {
    const subjects: { [key: string]: string } = {
      'arabe': 'Arabe',
      'francais': 'Français',
      'maths': 'Mathématiques',
      'sciences': 'Sciences',
      'histoire': 'Histoire',
      'geographie': 'Géographie'
    };
    return subjects[subject] || subject.charAt(0).toUpperCase() + subject.slice(1);
  }
  
  private getSubjectIcon(subject: string): string {
    const icons: { [key: string]: string } = {
      'arabe': 'fa-language',
      'francais': 'fa-book',
      'maths': 'fa-calculator',
      'sciences': 'fa-flask',
      'histoire': 'fa-landmark',
      'geographie': 'fa-globe'
    };
    return icons[subject] || 'fa-book';
  }
  
  // Reset navigation
  reset() {
    this.navigationStack = [];
    this.breadcrumb.set([]);
    this.currentPath.set('');
  }
}
