import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';

@Component({
    imports: [CommonModule, ReactiveFormsModule, PasswordModule, ButtonModule],
    standalone:true,
    template: `
    <h2 class="text-xl font-semibold mb-4">🔒 Sécurité</h2>
    <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4 max-w-md">
      <input pPassword formControlName="currentPassword" placeholder="Mot de passe actuel" class="w-full" />
      <input pPassword formControlName="newPassword" placeholder="Nouveau mot de passe" class="w-full" />
      <input pPassword formControlName="confirmPassword" placeholder="Confirmation" class="w-full" />
      <button pButton type="submit" label="Changer le mot de passe" [disabled]="form.invalid"></button>
    </form>
  `
})
export class SecurityComponent {
  form: FormGroup;
  private fb = inject(FormBuilder);

  constructor() {
    this.form = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  submit() {
    if (this.form.value.newPassword !== this.form.value.confirmPassword) {
      alert('Les mots de passe ne correspondent pas.');
      return;
    }

    console.log('TODO: appel API pour changer le mot de passe');
  }
}
