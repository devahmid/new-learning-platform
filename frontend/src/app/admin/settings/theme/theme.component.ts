import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    imports: [CommonModule],
    standalone:true,
    template: `
    <h2 class="text-xl font-semibold mb-4">🎨 Thème</h2>
    <button (click)="toggle()" class="bg-gray-100 border px-4 py-2 rounded shadow">
      Passer en {{ theme() === 'light' ? 'sombre' : 'clair' }}
    </button>
  `
})
export class ThemeComponent {
  theme = signal<'light' | 'dark'>('light');

  toggle() {
    const newTheme = this.theme() === 'light' ? 'dark' : 'light';
    this.theme.set(newTheme);
    document.body.classList.toggle('dark', newTheme === 'dark');
  }
}
