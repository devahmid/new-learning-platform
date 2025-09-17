import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      *ngIf="notificationService.isVisible()" 
      class="fixed top-4 right-4 z-50 max-w-sm"
      [ngClass]="{
        'bg-red-100 border-red-400 text-red-700': notificationService.type() === 'error',
        'bg-blue-100 border-blue-400 text-blue-700': notificationService.type() === 'info',
        'bg-green-100 border-green-400 text-green-700': notificationService.type() === 'success'
      }"
      class="px-4 py-3 rounded-lg border shadow-lg animate-slide-in">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <i 
            class="text-lg"
            [ngClass]="{
              'fa-solid fa-exclamation-circle text-red-500': notificationService.type() === 'error',
              'fa-solid fa-info-circle text-blue-500': notificationService.type() === 'info',
              'fa-solid fa-check-circle text-green-500': notificationService.type() === 'success'
            }">
          </i>
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium">{{ notificationService.message() }}</p>
        </div>
        <div class="ml-auto pl-3">
          <button 
            (click)="notificationService.clear()"
            class="text-gray-400 hover:text-gray-600 focus:outline-none">
            <i class="fa-solid fa-times"></i>
          </button>
        </div>
      </div>
    </div>
    <!-- Debug info -->
    <!-- <div class="fixed bottom-4 right-4 bg-black text-white p-2 text-xs z-50">
      Debug: {{ notificationService.isVisible() ? 'Visible' : 'Hidden' }} - {{ notificationService.message() }}
    </div> -->
  `,
  styles: [`
    @keyframes slide-in {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    .animate-slide-in {
      animation: slide-in 0.3s ease-out;
    }
  `]
})
export class NotificationComponent {
  notificationService = inject(NotificationService);
}
