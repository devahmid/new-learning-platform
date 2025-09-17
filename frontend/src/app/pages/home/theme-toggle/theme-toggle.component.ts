import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      (click)="toggle()"
      class="text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 text-xl transition"
      [attr.aria-label]="
        isDark() ? 'Activer le mode clair' : 'Activer le mode sombre'
      "
    >
      <i class="pi" [ngClass]="isDark() ? 'pi-moon' : 'pi-sun'"></i>
    </button>
  `,
})
export class ThemeToggleComponent implements OnInit {
  isDark = signal(false);

  ngOnInit() {
    this.isDark.set(this.isDarkTheme());
    this.applyTheme();
  }

  toggle() {
    this.isDark.update((d) => !d);
    this.applyTheme();
    localStorage.setItem('theme', this.isDark() ? 'dark' : 'light');
  }

  private applyTheme() {
    const root = document.documentElement;
    const body = document.body;

    if (this.isDark()) {
      root.classList.add('dark');
      body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
    }
  }

  private isDarkTheme(): boolean {
    const stored = localStorage.getItem('theme');
    return stored === 'dark';
  }
}
