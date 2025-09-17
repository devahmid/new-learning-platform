import { Component, Input, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

export interface BreadcrumbItem {
  label: string;
  path: string;
  icon: string;
  isActive?: boolean;
}

@Component({
  selector: 'app-global-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-4 bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 shadow-sm border border-gray-200/50" aria-label="Breadcrumb">
      <a routerLink="/" class="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200 flex items-center gap-1">
        <i class="fa-solid fa-home"></i>
        <span class="hidden sm:inline">Accueil</span>
      </a>
      
      <ng-container *ngFor="let item of breadcrumbItems; let last = last">
        <i class="fa-solid fa-chevron-right text-xs mx-1"></i>
        
        <a *ngIf="!last && !item.isActive" 
           [routerLink]="item.path"
           class="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200 flex items-center gap-1">
          <i [class]="'fa-solid ' + item.icon"></i>
          <span class="hidden sm:inline">{{ item.label }}</span>
        </a>
        
        <span *ngIf="last || item.isActive" 
              class="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
          <i [class]="'fa-solid ' + item.icon"></i>
          <span class="hidden sm:inline">{{ item.label }}</span>
        </span>
      </ng-container>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class GlobalBreadcrumbComponent implements OnInit {
  @Input() breadcrumbItems: BreadcrumbItem[] = [];
  
  constructor(private router: Router) {}
  
  ngOnInit() {
    // Si pas de breadcrumb fourni, générer automatiquement basé sur l'URL
    if (this.breadcrumbItems.length === 0) {
      this.breadcrumbItems = this.generateBreadcrumbFromUrl();
    }
  }
  
  private generateBreadcrumbFromUrl(): BreadcrumbItem[] {
    const url = this.router.url;
    const segments = url.split('/').filter(segment => segment);
    const breadcrumb: BreadcrumbItem[] = [];
    
    // Page d'accueil
    if (segments.length === 0) {
      return [{ label: 'Accueil', path: '/', icon: 'fa-home', isActive: true }];
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
                path: `/cours/${segments[1]}/${segments[2]}/lesson/${segments[5]}`, 
                icon: 'fa-play-circle',
                isActive: true
              });
            }
          }
        }
      }
    }
    
    // Route niveau-user /cours/:subjectName/:level (liste des cours)
    if (segments[0] === 'cours' && segments[1] && segments[2] && !segments[3]) {
      breadcrumb.push({ label: 'Matières', path: '/matières', icon: 'fa-book' });
      const subjectName = this.getSubjectName(segments[1]);
      breadcrumb.push({ 
        label: subjectName, 
        path: `/matières/${segments[1]}`, 
        icon: this.getSubjectIcon(segments[1]) 
      });
      breadcrumb.push({ 
        label: `Niveau ${segments[2]}`, 
        path: `/cours/${segments[1]}/${segments[2]}`, 
        icon: 'fa-graduation-cap',
        isActive: true
      });
    }
    
    // Route cours-detail /cours/:id (détail d'un cours)
    if (segments[0] === 'cours' && segments[1] && !segments[2]) {
      breadcrumb.push({ label: 'Matières', path: '/matières', icon: 'fa-book' });
      breadcrumb.push({ 
        label: `Cours ${segments[1]}`, 
        path: `/cours/${segments[1]}`, 
        icon: 'fa-book-open',
        isActive: true
      });
    }
    
    // Route leçon /cours/:subject/:level/lesson/:id
    if (segments[0] === 'cours' && segments[1] && segments[2] === 'lesson' && segments[3]) {
      breadcrumb.push({ label: 'Matières', path: '/matières', icon: 'fa-book' });
      const subjectName = this.getSubjectName(segments[1]);
      breadcrumb.push({ 
        label: subjectName, 
        path: `/matières/${segments[1]}`, 
        icon: this.getSubjectIcon(segments[1]) 
      });
      breadcrumb.push({ 
        label: `Leçon ${segments[3]}`, 
        path: `/cours/${segments[1]}/lesson/${segments[3]}`, 
        icon: 'fa-play-circle',
        isActive: true
      });
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
}
