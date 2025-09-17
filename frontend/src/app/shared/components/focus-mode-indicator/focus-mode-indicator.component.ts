import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-focus-mode-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4">
      <h3 class="text-lg font-semibold mb-2">Indicateur de Mode Focus</h3>
      <p>Composant d'indicateur de mode focus en cours de développement...</p>
    </div>
  `
})
export class FocusModeIndicatorComponent {}
