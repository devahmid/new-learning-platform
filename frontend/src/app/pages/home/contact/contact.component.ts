import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ContactService, ContactMessage } from '../../../services/contact.service';

@Component({
    selector: 'app-contact',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './contact.component.html',
    styleUrl: './contact.component.scss'
})
export class ContactComponent implements OnInit {
  contactForm: FormGroup;
  isSubmitting = false;
  submitSuccess = false;
  submitError = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private contactService: ContactService
  ) {
    this.contactForm = this.createContactForm();
  }

  ngOnInit(): void {
    // Initialisation si nécessaire
  }

  private createContactForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      subject: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      this.isSubmitting = true;
      this.submitSuccess = false;
      this.submitError = false;

      const messageData: ContactMessage = this.contactForm.value;
      
      this.contactService.sendMessage(messageData).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.submitSuccess = true;
          
          // Réinitialiser le formulaire après 3 secondes
          setTimeout(() => {
            this.contactForm.reset();
            this.submitSuccess = false;
          }, 3000);
        },
        error: (error) => {
          console.error('Erreur lors de l\'envoi du message:', error);
          this.isSubmitting = false;
          this.submitError = true;
          
          // Masquer l'erreur après 5 secondes
          setTimeout(() => {
            this.submitError = false;
          }, 5000);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.contactForm.controls).forEach(key => {
      const control = this.contactForm.get(key);
      control?.markAsTouched();
    });
  }

  // Méthodes helper pour le template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.contactForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.contactForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) {
        return 'Ce champ est requis';
      }
      if (field.errors['email']) {
        return 'Veuillez entrer une adresse email valide';
      }
      if (field.errors['minlength']) {
        return `Minimum ${field.errors['minlength'].requiredLength} caractères`;
      }
    }
    return '';
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }

  navigateToPricing(): void {
    this.router.navigate(['/tarifs']);
  }
}
