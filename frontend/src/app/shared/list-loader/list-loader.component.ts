import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-list-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-4">
      <!-- Skeleton items -->
      <div *ngFor="let item of [].constructor(count)" class="animate-pulse">
        <div class="flex items-center space-x-4">
          <!-- Avatar skeleton -->
          <div class="w-12 h-12 bg-gray-200 rounded-full"></div>

          <!-- Content skeleton -->
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-gray-200 rounded w-3/4"></div>
            <div class="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>

          <!-- Action skeleton -->
          <div class="w-20 h-8 bg-gray-200 rounded"></div>
        </div>
      </div>

      <!-- Spinner en bas -->
      <div class="flex justify-center pt-4">
        <div class="relative">
          <div
            class="w-8 h-8 border-2 border-blue-200 rounded-full animate-pulse"
          ></div>
          <div
            class="absolute top-0 left-0 w-8 h-8 border-2 border-transparent border-t-blue-600 border-r-indigo-500 rounded-full animate-spin"
          ></div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class ListLoaderComponent {
  @Input() count: number = 3;
  @Input() showSpinner: boolean = true;
}
