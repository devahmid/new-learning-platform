import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    imports: [CommonModule, FormsModule],
    standalone:true,
    template: `
    <h2 class="text-xl font-semibold mb-4">⚙️ Paramètres de l'application</h2>
    <label class="block mb-2">Langue préférée</label>
    <select [(ngModel)]="langue" class="border rounded px-2 py-1">
      <option value="fr">Français</option>
      <option value="ar">Arabe</option>
      <option value="en">Anglais</option>
    </select>
  `
})
export class AppComponent {
  langue = 'fr';
}
