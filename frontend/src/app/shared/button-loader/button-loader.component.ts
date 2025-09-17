import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-button-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="inline-flex items-center space-x-2">
      <!-- Spinner avec gradient et animation -->
      <div class="relative">
        <!-- Cercle externe rotatif -->
        <div
          class="w-4 h-4 border-2 border-transparent border-t-current border-r-current rounded-full animate-spin"
        ></div>

        <!-- Point central avec gradient -->
        <div
          class="absolute top-0.5 left-0.5 w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse"
        ></div>

        <!-- Particules flottantes -->
        <div
          class="absolute -top-1 -right-1 w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping opacity-75"
        ></div>
        <div
          class="absolute -bottom-1 -left-1 w-1 h-1 bg-indigo-400 rounded-full animate-ping opacity-75"
          style="animation-delay: 500ms"
        ></div>
      </div>

      <!-- Texte avec animation de typewriter -->
      <span class="text-sm font-medium text-current animate-pulse">{{
        text
      }}</span>
    </div>
  `,
  styles: [],
})
export class ButtonLoaderComponent {
  @Input() text: string = 'Chargement...';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() variant: 'default' | 'primary' | 'secondary' = 'default';
}
