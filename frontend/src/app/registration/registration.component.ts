import { CommonModule, NgFor, NgIf } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RegistrationService } from '../services/registration.service';
import { ProgressBarModule } from 'primeng/progressbar';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule,
    // PrimeNG modules
    InputTextModule,
    DropdownModule,
    CheckboxModule,
    ButtonModule,
    InputTextareaModule,
    ProgressBarModule
  ],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.scss'
})
export class RegistrationComponent implements OnInit {
  form!: FormGroup;
  submitting = false;

  arabicLevels = [
    { label: '1 : Débutant (ne sait ni lire ni écrire)', value: 1 },
    { label: '2 : Commence à lire', value: 2 },
    { label: '3 : Sait lire et écrire, apprend du vocabulaire', value: 3 },
    { label: '4 : Apprend la grammaire et du nouveau vocabulaire', value: 4 },
    { label: '5 : Lit et écrit couramment, apprend la grammaire et du nouveau vocabulaire', value: 5 },
  ];


  constructor(
    private fb: FormBuilder,
    private registrationService: RegistrationService,
    private router: Router,
    private toast: MessageService
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, this.validatePhone]],
      wasRegisteredLastYear: [null, Validators.required],
      acceptedConditions: [false, Validators.requiredTrue],
      children: this.fb.array([]),
    });

    this.addChild();
  }

  get totalPrice(): number {
    const count = this.children.length;
    if (count >= 3) return count * 220;
    return count * 250;
  }


  get children(): FormArray {
    return this.form.get('children') as FormArray;
  }

  addChild(): void {
    const group = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      birthDate: ['', [Validators.required, this.validateMinAge(6)]],
      arabicLevel: [1, Validators.required],
      activityDetails: [''],
      hasActivityOnWednesday: [false],
      hasActivityOnSaturday: [false],
      hasActivityOnSunday: [false],
    }, { validators: this.activityValidator() });

    this.children.push(group);
  }

  removeChild(index: number): void {
    this.children.removeAt(index);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting = true;
    this.registrationService.submitRegistration(this.form.value).subscribe({
      next: (response) => {
        this.submitting = false;
        this.form.reset();
        this.children.clear();
        this.addChild();
        this.toast.add({
          severity: 'success',
          summary: 'Inscription réussie',
          detail: 'Vous allez être redirigé...',
          life: 4000,
        });

        setTimeout(() => {
          this.submitting = false;
          this.router.navigate(['/inscription-ok']);
        }, 2000);
      },
      error: (error) => {
        this.submitting = false;
        this.toast.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Une erreur est survenue. Veuillez réessayer.',
        });
        console.log('error ', error)
      }
    });
  }

  validatePhone(control: AbstractControl): ValidationErrors | null {
    const value = control.value || '';
    const frenchPhoneRegex = /^(?:\+33|0)[1-9](?:[\s.-]?\d{2}){4}$/;
    return frenchPhoneRegex.test(value) ? null : { invalidPhone: true };
  }

  validateMinAge(minAge: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const birthDate = new Date(control.value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();
      const isOldEnough = age > minAge || (age === minAge && (monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0)));
      return isOldEnough ? null : { tooYoung: true };
    };
  }

  activityValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const hasActivity =
        group.get('hasActivityOnWednesday')?.value ||
        group.get('hasActivityOnSaturday')?.value ||
        group.get('hasActivityOnSunday')?.value;

      const details = group.get('activityDetails')?.value?.trim();

      if (hasActivity && !details) {
        group.get('activityDetails')?.setErrors({ required: true });
        return { activityDetailsRequired: true };
      }

      group.get('activityDetails')?.setErrors(null);
      return null;
    };
  }
}
