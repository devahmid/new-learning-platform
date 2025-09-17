import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="fullName"
      class="flex items-center gap-3 p-2 rounded-2xl bg-gradient-to-r from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 border border-emerald-200/50 hover:border-emerald-300 transition-all duration-300 cursor-pointer group"
    >
      <div
        class="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center text-sm font-bold shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110"
      >
        {{ getInitials(fullName) }}
      </div>
      <span
        class="hidden md:inline text-sm font-semibold text-gray-700 group-hover:text-emerald-800 transition-colors duration-300"
        >{{ fullName }}</span
      >
      <i
        class="fa-solid fa-chevron-down text-xs text-emerald-500 group-hover:text-emerald-600 transition-colors duration-300 group-hover:rotate-180"
      ></i>
    </div>
  `,
})
export class UserBadgeComponent {
  @Input() fullName: string | null = null;

  getInitials(name: string | null): string {
    if (!name) return '';
    const parts = name.trim().split(' ');
    return parts
      .map((p) => p.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }
}
