import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-child-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-4">Sélecteur d'Enfant</h2>
      <p>Composant de sélecteur d'enfant en cours de développement...</p>
    </div>
  `
})
export class ChildSelectorComponent {}
