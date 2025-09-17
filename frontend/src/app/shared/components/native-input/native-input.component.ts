import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-native-input',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NativeInputComponent),
      multi: true,
    },
  ],
  template: `
    <div class="native-input-container">
      <label *ngIf="label" [for]="id" class="native-input-label">
        {{ label }}
        <span *ngIf="required" class="text-red-500 ml-1">*</span>
      </label>

      <input
        [id]="id"
        [type]="inputType"
        [placeholder]="placeholder"
        [value]="value"
        [disabled]="disabled"
        [required]="required"
        [class]="getInputClasses()"
        (input)="onInput($event)"
        (blur)="onBlur()"
        (focus)="onFocus()"
      />

      <div *ngIf="hint" class="native-input-hint">
        {{ hint }}
      </div>

      <div *ngIf="error" class="native-input-error">
        <i class="fa-solid fa-exclamation-circle mr-1"></i>
        {{ error }}
      </div>
    </div>
  `,
  styles: [
    `
      .native-input-container {
        @apply w-full;
      }

      .native-input-label {
        @apply block text-sm font-medium text-gray-700 mb-2;
      }

      .native-input {
        @apply block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400
               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
               disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
               transition-colors duration-200;
      }

      .native-input-error-state {
        @apply border-red-300 focus:ring-red-500 focus:border-red-500;
      }

      .native-input-hint {
        @apply mt-1 text-sm text-gray-500;
      }

      .native-input-error {
        @apply mt-1 text-sm text-red-600 flex items-center;
      }
    `,
  ],
})
export class NativeInputComponent implements ControlValueAccessor {
  @Input() id = '';
  @Input() label = '';
  @Input() placeholder = '';
  @Input() inputType: 'text' | 'email' | 'password' | 'number' = 'text';
  @Input() hint = '';
  @Input() error = '';
  @Input() required = false;
  @Input() disabled = false;

  @Output() inputChange = new EventEmitter<string>();
  @Output() blur = new EventEmitter<void>();
  @Output() focus = new EventEmitter<void>();

  value = '';

  // ControlValueAccessor implementation
  onChange = (value: string) => {};
  onTouched = () => {};

  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
    this.inputChange.emit(this.value);
  }

  onBlur(): void {
    this.onTouched();
    this.blur.emit();
  }

  onFocus(): void {
    this.focus.emit();
  }

  getInputClasses(): string {
    const baseClass = 'native-input';
    const stateClass = this.error ? 'native-input-error-state' : '';

    return `${baseClass} ${stateClass}`.trim();
  }
}
