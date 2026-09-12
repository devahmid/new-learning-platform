import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FeedbackService } from './feedback.service';
import { FeedbackQuestionComponent } from './feedback-question.component';

type RatingKey =
  | 'overall'
  | 'navigation'
  | 'clarity'
  | 'design'
  | 'mobile'
  | 'speed'
  | 'trust';

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    FeedbackQuestionComponent,
  ],
  templateUrl: './feedback.component.html',
  styleUrl: './feedback.component.scss',
})
export class FeedbackComponent {
  readonly ratingScale = [1, 2, 3, 4, 5];

  submitting = false;
  submitted = false;
  errorMessage = '';

  form = this.fb.group({
    overall: [null as number | null, [Validators.required]],
    navigation: [null as number | null, [Validators.required]],
    clarity: [null as number | null, [Validators.required]],
    design: [null as number | null, [Validators.required]],
    mobile: [null as number | null, [Validators.required]],
    speed: [null as number | null, [Validators.required]],
    trust: [null as number | null, [Validators.required]],
    nps: [null as number | null],
    improvement: [''],
    consentToContact: [false],
    email: [''],
  });

  constructor(
    private fb: FormBuilder,
    private feedbackService: FeedbackService
  ) {}

  setRating(key: RatingKey, value: number) {
    this.form.get(key)?.setValue(value);
    this.form.get(key)?.markAsTouched();
  }

  ratingLabel(value: number): string {
    switch (value) {
      case 1:
        return 'Très mauvais';
      case 2:
        return 'Mauvais';
      case 3:
        return 'Moyen';
      case 4:
        return 'Bien';
      case 5:
        return 'Excellent';
      default:
        return '';
    }
  }

  submit() {
    this.errorMessage = '';
    this.submitted = false;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage =
        'Merci de répondre aux questions obligatoires avant d’envoyer.';
      return;
    }

    const raw = this.form.getRawValue();
    const consent = !!raw.consentToContact;
    const email = (raw.email ?? '').trim();

    if (consent && !email) {
      this.errorMessage =
        'Si vous souhaitez être recontacté, merci de renseigner votre email.';
      return;
    }

    this.submitting = true;

    this.feedbackService
      .submit({
        overall: raw.overall!,
        navigation: raw.navigation!,
        clarity: raw.clarity!,
        design: raw.design!,
        mobile: raw.mobile!,
        speed: raw.speed!,
        trust: raw.trust!,
        nps: raw.nps ?? null,
        improvement: (raw.improvement ?? '').trim() || null,
        consentToContact: consent,
        email: consent ? email : null,
        source: typeof window !== 'undefined' ? window.location.href : null,
      })
      .subscribe({
        next: () => {
          this.submitting = false;
          this.submitted = true;
          this.form.reset({
            overall: null,
            navigation: null,
            clarity: null,
            design: null,
            mobile: null,
            speed: null,
            trust: null,
            nps: null,
            improvement: '',
            consentToContact: false,
            email: '',
          });
        },
        error: () => {
          this.submitting = false;
          this.errorMessage =
            "Une erreur est survenue lors de l’envoi. Merci de réessayer plus tard.";
        },
      });
  }
}

