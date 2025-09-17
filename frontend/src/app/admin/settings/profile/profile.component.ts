import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../auth/auth.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
    imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule],
    standalone:true,
    template: `
    <h2 class="text-xl font-semibold mb-4">👤 Mon profil</h2>
    <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4 max-w-md">
      <input pInputText formControlName="firstName" placeholder="Prénom" class="w-full" />
      <input pInputText formControlName="lastName" placeholder="Nom" class="w-full" />
      <input pInputText formControlName="email" placeholder="Email" class="w-full" />
      <button pButton type="submit" label="Mettre à jour" [disabled]="form.invalid"></button>
    </form>
  `
})
export class ProfileComponent {
  form: FormGroup;
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);

  constructor() {
    const user = this.auth.user();
    this.form = this.fb.group({
      firstName: [user?.firstName, Validators.required],
      lastName: [user?.lastName, Validators.required],
      email: [user?.email, [Validators.required, Validators.email]],
    });
  }

  submit() {
    console.log('TODO: appel API pour update le profil', this.form.value);
  }
}
