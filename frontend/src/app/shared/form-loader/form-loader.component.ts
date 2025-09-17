import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-form-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-center py-6">
      <div class="text-center">
        <!-- Spinner principal -->
        <div class="relative mx-auto mb-4">
          <div
            class="w-12 h-12 border-4 border-blue-200 rounded-full animate-pulse"
          ></div>
          <div
            class="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-blue-600 border-r-indigo-500 rounded-full animate-spin"
          ></div>
          <div
            class="absolute top-1 left-1 w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse shadow-lg"
          ></div>
        </div>

        <!-- Texte -->
        <p class="text-sm font-medium text-gray-600">{{ text }}</p>

        <!-- Points animés -->
        <div class="flex space-x-1 justify-center mt-2">
          <div
            class="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"
            style="animation-delay: 0ms"
          ></div>
          <div
            class="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"
            style="animation-delay: 150ms"
          ></div>
          <div
            class="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce"
            style="animation-delay: 300ms"
          ></div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class FormLoaderComponent {
  @Input() text: string = 'Traitement en cours...';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
}
