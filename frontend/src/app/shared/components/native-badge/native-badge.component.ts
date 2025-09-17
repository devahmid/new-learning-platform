import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeSeverity = 'success' | 'info' | 'warn' | 'error' | 'secondary';

@Component({
  selector: 'app-native-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="native-badge"
      [class]="getBadgeClasses()"
      [attr.data-value]="value"
    >
      {{ value }}
    </span>
  `,
  styles: [
    `
      .native-badge {
        @apply inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full;
      }

      .native-badge-success {
        @apply bg-green-100 text-green-800;
      }

      .native-badge-info {
        @apply bg-blue-100 text-blue-800;
      }

      .native-badge-warn {
        @apply bg-yellow-100 text-yellow-800;
      }

      .native-badge-error {
        @apply bg-red-100 text-red-800;
      }

      .native-badge-secondary {
        @apply bg-gray-100 text-gray-800;
      }

      /* Sizes */
      .native-badge-sm {
        @apply px-1.5 py-0.5 text-xs;
      }

      .native-badge-md {
        @apply px-2 py-1 text-xs;
      }

      .native-badge-lg {
        @apply px-3 py-1.5 text-sm;
      }
    `,
  ],
})
export class NativeBadgeComponent {
  @Input() value: string | number = '';
  @Input() severity: BadgeSeverity = 'secondary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  getBadgeClasses(): string {
    const baseClass = 'native-badge';
    const severityClass = `native-badge-${this.severity}`;
    const sizeClass = `native-badge-${this.size}`;

    return `${baseClass} ${severityClass} ${sizeClass}`;
  }
}
