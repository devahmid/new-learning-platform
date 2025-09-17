import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonType =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-native-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled"
      (click)="onClick($event)"
      class="native-button"
      [class]="getButtonClasses()"
    >
      <i *ngIf="icon" [class]="icon" class="mr-2"></i>
      <span>{{ label }}</span>
    </button>
  `,
  styles: [
    `
      .native-button {
        @apply font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed;
      }

      .native-button:not(:disabled):hover {
        @apply transform scale-105;
      }

      .native-button-primary {
        @apply bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500;
      }

      .native-button-secondary {
        @apply bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500;
      }

      .native-button-success {
        @apply bg-green-600 text-white hover:bg-green-700 focus:ring-green-500;
      }

      .native-button-danger {
        @apply bg-red-600 text-white hover:bg-red-700 focus:ring-red-500;
      }

      .native-button-warning {
        @apply bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500;
      }

      .native-button-info {
        @apply bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-400;
      }

      .native-button-sm {
        @apply px-3 py-1.5 text-sm;
      }

      .native-button-md {
        @apply px-4 py-2 text-base;
      }

      .native-button-lg {
        @apply px-6 py-3 text-lg;
      }
    `,
  ],
})
export class NativeButtonComponent {
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() buttonType: ButtonType = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() disabled = false;
  @Input() icon = '';
  @Input() label = '';

  @Output() click = new EventEmitter<MouseEvent>();

  onClick(event: MouseEvent) {
    if (!this.disabled) {
      this.click.emit(event);
    }
  }

  getButtonClasses(): string {
    const baseClass = 'native-button';
    const typeClass = `native-button-${this.buttonType}`;
    const sizeClass = `native-button-${this.size}`;

    return `${baseClass} ${typeClass} ${sizeClass}`;
  }
}
