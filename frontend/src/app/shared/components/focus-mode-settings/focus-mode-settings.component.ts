import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-focus-mode-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4">
      <h3 class="text-lg font-semibold mb-2">Paramètres du Mode Focus</h3>
      <p>Composant de paramètres du mode focus en cours de développement...</p>
    </div>
  `
})
export class FocusModeSettingsComponent {}
