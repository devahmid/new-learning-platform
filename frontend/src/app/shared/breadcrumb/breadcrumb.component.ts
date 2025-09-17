import { Component, Input, OnInit, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NavigationService, BreadcrumbItem } from '../../services/navigation.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400" 
         aria-label="Breadcrumb">
      <a routerLink="/" 
         class="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200">
        <i class="fa-solid fa-home"></i>
      </a>
      
      <ng-container *ngFor="let item of breadcrumbItems; let last = last">
        <i class="fa-solid fa-chevron-right text-xs mx-2"></i>
        
        <a *ngIf="!last" 
           [routerLink]="item.path"
           class="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200 flex items-center gap-2">
          <i *ngIf="item.icon" [class]="'fa-solid ' + item.icon"></i>
          {{ item.label }}
        </a>
        
        <span *ngIf="last" 
              class="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-2">
          <i *ngIf="item.icon" [class]="'fa-solid ' + item.icon"></i>
          {{ item.label }}
        </span>
      </ng-container>
    </nav>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class BreadcrumbComponent implements OnInit {
  @Input() breadcrumbItems: BreadcrumbItem[] = [];
  
  private navigationService = inject(NavigationService);
  private router = inject(Router);
  
  ngOnInit() {
    // Si pas de breadcrumb fourni, utiliser celui du service
    if (this.breadcrumbItems.length === 0) {
      this.breadcrumbItems = this.navigationService.getBreadcrumb()();
    }
  }
}
