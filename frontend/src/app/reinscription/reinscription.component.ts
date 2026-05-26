import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { ParentService } from '../_children-context/_children-context/parent.service';
import { RegistrationService } from '../services/registration.service';
import { User } from '../models/user.model';

interface ReinscriptionChildValue {
  sourceChildId?: number | null;
  firstName: string;
  lastName: string;
  birthDate: string;
  arabicLevel: number;
  hasActivityOnWednesday: boolean;
  hasActivityOnSaturday: boolean;
  hasActivityOnSunday: boolean;
  activityDetails: string;
}

@Component({
  selector: 'app-reinscription',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reinscription.component.html',
  styleUrl: './reinscription.component.scss',
})
export class ReinscriptionComponent implements OnInit {
  form!: FormGroup;
  loadingProfile = true;
  submitting = false;
  submitted = false;
  profileMode: 'guest' | 'connected' = 'guest';
  selectedFlow: 'renewal' | 'new' | null = null;
  requiresLogin = false;
  successMessage = '';
  errorMessage = '';

  readonly arabicLevels = [
    { label: '1 : Débutant', value: 1 },
    { label: '2 : Commence à lire', value: 2 },
    { label: '3 : Lit et écrit avec accompagnement', value: 3 },
    { label: '4 : Niveau intermédiaire', value: 4 },
    { label: '5 : Niveau avancé', value: 5 },
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private parentService: ParentService,
    private registrationService: RegistrationService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.route.queryParams.subscribe((params) => {
      const mode = params['mode'];
      this.selectedFlow = mode === 'renewal' ? 'renewal' : mode === 'new' ? 'new' : null;
      this.requiresLogin = this.selectedFlow === 'renewal' && !this.hasConnectedProfile;

      if (this.selectedFlow === 'renewal' && this.hasConnectedProfile) {
        this.requiresLogin = false;
      }
    });
    this.prefillFromConnectedProfile();
  }

  get children(): FormArray {
    return this.form.get('children') as FormArray;
  }

  get connectedUser() {
    return this.authService.user();
  }

  get hasConnectedProfile(): boolean {
    return !!this.connectedUser;
  }

  chooseFlow(flow: 'renewal' | 'new'): void {
    this.selectedFlow = flow;

    if (flow === 'renewal') {
      if (this.hasConnectedProfile) {
        this.requiresLogin = false;
        this.prefillFromConnectedProfile();
        return;
      }

      this.requiresLogin = true;
      this.router.navigate(['/login'], {
        queryParams: {
          returnUrl: '/reinscription?mode=renewal',
          mode: 'renewal',
        },
      });
      return;
    }

    this.requiresLogin = false;
    this.loadingProfile = false;
    if (this.children.length === 0) {
      this.addChild();
    }
  }

  addChild(prefill: Partial<ReinscriptionChildValue> = {}): void {
    this.children.push(this.createChildGroup(prefill));
  }

  removeChild(index: number): void {
    if (this.children.length === 1) {
      return;
    }

    this.children.removeAt(index);
  }

  submit(): void {
    if (!this.selectedFlow) {
      this.errorMessage = 'Choisissez d’abord si vous renouvelez une inscription ou si vous déposez une nouvelle demande.';
      return;
    }

    if (this.selectedFlow === 'renewal' && !this.hasConnectedProfile) {
      this.requiresLogin = true;
      this.router.navigate(['/login'], {
        queryParams: {
          returnUrl: '/reinscription?mode=renewal',
          mode: 'renewal',
        },
      });
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = 'Veuillez compléter les champs obligatoires avant l’envoi.';
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    const payload = {
      ...this.form.getRawValue(),
      children: this.children.controls.map((control) => control.getRawValue()),
        requestType: this.selectedFlow ?? 'new',
        schoolYear: this.resolveSchoolYear(),
      wasRegisteredLastYear: this.selectedFlow === 'renewal',
      sourceUserId: this.connectedUser?.id ?? null,
      parentSnapshot: this.hasConnectedProfile
        ? {
            id: this.connectedUser?.id,
            firstName: this.connectedUser?.firstName ?? '',
            lastName: this.connectedUser?.lastName ?? '',
            email: this.connectedUser?.email ?? '',
            phoneNumber: this.connectedUser?.phoneNumber ?? '',
            type: this.connectedUser?.type ?? 'parent',
            status: this.connectedUser?.status ?? null,
          }
        : null,
      childrenSnapshot: this.hasConnectedProfile
        ? this.children.controls.map((control) => control.getRawValue())
        : null,
    };

    this.registrationService.submitReinscription(payload).subscribe({
      next: () => {
        this.submitting = false;
        this.submitted = true;
        this.successMessage = this.profileMode === 'connected'
          ? 'Votre réinscription a bien été envoyée. Vos informations ont été reprises depuis votre compte et restent modifiables avant validation.'
          : 'Votre demande de réinscription a bien été envoyée. Nous reviendrons vers vous pour la validation.';
      },
      error: () => {
        this.submitting = false;
        this.errorMessage = 'Une erreur est survenue pendant l’envoi. Veuillez réessayer.';
      },
    });
  }

  isSelectedLevel(control: AbstractControl, level: number): boolean {
    return control.get('arabicLevel')?.value === level;
  }

  private buildForm(): void {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, this.validatePhone]],
      acceptedConditions: [false, Validators.requiredTrue],
      children: this.fb.array([this.createChildGroup()]),
    });
  }

  private prefillFromConnectedProfile(): void {
    const currentUser = this.connectedUser;

    if (currentUser) {
      this.profileMode = 'connected';
      this.requiresLogin = false;
      this.form.patchValue({
        fullName: [currentUser.firstName, currentUser.lastName].filter(Boolean).join(' '),
        email: currentUser.email ?? '',
        phone: currentUser.phoneNumber ?? '',
      });

      if (Array.isArray(currentUser.children) && currentUser.children.length > 0) {
        this.setChildrenFromProfile(currentUser.children as User[]);
        this.loadingProfile = false;
        return;
      }

      if (this.authService.isParent()) {
        this.parentService.getChildrenOfLoggedInParent().subscribe({
          next: (children) => {
            this.setChildrenFromProfile(children || []);
            this.loadingProfile = false;
          },
          error: () => {
            this.loadingProfile = false;
          },
        });

        return;
      }
    }

    this.loadingProfile = false;
  }

  private setChildrenFromProfile(children: User[]): void {
    this.children.clear();

    if (!children.length) {
      this.addChild();
      return;
    }

    children.forEach((child) => {
      this.children.push(
        this.createChildGroup({
          sourceChildId: child.id ?? null,
          firstName: this.getChildFirstName(child),
          lastName: this.getChildLastName(child),
          birthDate: this.normalizeDate(child.dateOfBirth),
          arabicLevel: this.resolveArabicLevel(child),
          activityDetails: this.getChildActivityDetails(child),
        })
      );
    });
  }

  private createChildGroup(prefill: Partial<ReinscriptionChildValue> = {}): FormGroup {
    return this.fb.group(
      {
        sourceChildId: [prefill.sourceChildId ?? null],
        firstName: [prefill.firstName ?? '', Validators.required],
        lastName: [prefill.lastName ?? '', Validators.required],
        birthDate: [prefill.birthDate ?? '', [Validators.required, this.minAgeValidator(4)]],
        arabicLevel: [prefill.arabicLevel ?? 1, Validators.required],
        hasActivityOnWednesday: [prefill.hasActivityOnWednesday ?? false],
        hasActivityOnSaturday: [prefill.hasActivityOnSaturday ?? false],
        hasActivityOnSunday: [prefill.hasActivityOnSunday ?? false],
        activityDetails: [prefill.activityDetails ?? ''],
      },
      { validators: this.activityValidator() }
    );
  }

  private validatePhone(control: AbstractControl): ValidationErrors | null {
    const value = String(control.value ?? '').trim();
    const frenchPhoneRegex = /^(?:\+33|0)[1-9](?:[\s.-]?\d{2}){4}$/;
    return frenchPhoneRegex.test(value) ? null : { invalidPhone: true };
  }

  private minAgeValidator(minAge: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const birthDate = new Date(control.value);
      if (Number.isNaN(birthDate.getTime())) {
        return { invalidDate: true };
      }

      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();
      const isOldEnough = age > minAge || (age === minAge && (monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0)));

      return isOldEnough ? null : { tooYoung: true };
    };
  }

  private activityValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const hasActivity =
        group.get('hasActivityOnWednesday')?.value ||
        group.get('hasActivityOnSaturday')?.value ||
        group.get('hasActivityOnSunday')?.value;
      const details = String(group.get('activityDetails')?.value ?? '').trim();

      if (hasActivity && !details) {
        group.get('activityDetails')?.setErrors({ required: true });
        return { activityDetailsRequired: true };
      }

      if (group.get('activityDetails')?.hasError('required')) {
        group.get('activityDetails')?.setErrors(null);
      }

      return null;
    };
  }

  private normalizeDate(value?: string | Date): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toISOString().slice(0, 10);
  }

  private resolveArabicLevel(child: User): number {
    const levelIdFromClass = (child.level as User & { levelId?: number } | undefined)?.levelId;
    if (typeof levelIdFromClass === 'number' && levelIdFromClass >= 1 && levelIdFromClass <= 5) {
      return levelIdFromClass;
    }

    const profileLevel = child.childProfile?.arabicLevel;
    if (profileLevel === 'debutant') return 1;
    if (profileLevel === 'lecture') return 2;
    if (profileLevel === 'ecriture') return 4;
    if (profileLevel === 'fluide') return 5;

    const classLevelId = (child.classe as User & { levelId?: number } | undefined)?.levelId;
    if (typeof classLevelId === 'number' && classLevelId >= 1 && classLevelId <= 5) {
      return classLevelId;
    }

    const levelName = child.level?.name?.toLowerCase() ?? '';
    if (levelName.includes('1') || levelName.includes('début')) return 1;
    if (levelName.includes('2')) return 2;
    if (levelName.includes('3')) return 3;
    if (levelName.includes('4')) return 4;
    if (levelName.includes('5') || levelName.includes('avanc')) return 5;

    return 1;
  }

  private getChildFirstName(child: User): string {
    return (
      child.firstName ??
      (child as User & { firstname?: string }).firstname ??
      (child as User & { prenom?: string }).prenom ??
      ''
    );
  }

  private getChildLastName(child: User): string {
    return (
      child.lastName ??
      (child as User & { lastname?: string }).lastname ??
      (child as User & { nom?: string }).nom ??
      ''
    );
  }

  private getChildActivityDetails(child: User): string {
    return (
      child.childProfile?.extracurricularDetails ??
      (child as User & { extracurricularDetails?: string }).extracurricularDetails ??
      (child as User & { activityDetails?: string }).activityDetails ??
      ''
    );
  }

  private resolveSchoolYear(): string {
    const year = new Date().getFullYear();
    return `${year}/${year + 1}`;
  }
}