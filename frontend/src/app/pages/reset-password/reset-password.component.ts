import { CommonModule } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { Component } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { PasswordModule } from "primeng/password";
import { AuthService } from "../../auth/auth.service";

@Component({
    selector: 'app-reset-password',
    standalone:true,
    imports: [CommonModule, ReactiveFormsModule, PasswordModule, ButtonModule, RouterModule],
    templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent {
  form = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  token: string = '';
  success = false;
  error = false;
  errorMessage = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private message: MessageService,
    private auth: AuthService
  ) {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    
    if (!this.token) {
      this.message.add({ 
        severity: 'error', 
        summary: 'Token manquant', 
        detail: 'Le lien de réinitialisation est invalide.' 
      });
      this.router.navigate(['/forgot-password']);
    }
  }

  passwordMatchValidator(form: any) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  submit() {
    if (this.form.invalid || !this.token) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.error = false;
    this.errorMessage = '';

    this.auth.resetPassword(this.token, this.form.value.password!).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.success = true;
        this.message.add({ 
          severity: 'success', 
          summary: 'Succès', 
          detail: 'Votre mot de passe a été mis à jour avec succès.' 
        });
        this.form.reset();
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.error = true;
        
        if (error.error && error.error.message) {
          this.errorMessage = error.error.message;
        } else if (error.error && error.error.errors) {
          // Gérer les erreurs de validation
          const errors = error.error.errors;
          if (errors.password) {
            this.errorMessage = errors.password.join(', ');
          } else if (errors.token) {
            this.errorMessage = errors.token.join(', ');
          } else {
            this.errorMessage = 'Erreur de validation des données.';
          }
        } else {
          this.errorMessage = 'Une erreur est survenue lors de la réinitialisation.';
        }
        
        this.message.add({ 
          severity: 'error', 
          summary: 'Erreur', 
          detail: this.errorMessage 
        });
      }
    });
  }

  private markFormGroupTouched() {
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      control?.markAsTouched();
    });
  }

  get passwordError() {
    const password = this.form.get('password');
    if (password?.touched && password?.errors) {
      if (password.errors['required']) return 'Le mot de passe est requis';
      if (password.errors['minlength']) return 'Le mot de passe doit contenir au moins 6 caractères';
    }
    return '';
  }

  get confirmPasswordError() {
    const confirmPassword = this.form.get('confirmPassword');
    if (confirmPassword?.touched && confirmPassword?.errors) {
      if (confirmPassword.errors['required']) return 'La confirmation du mot de passe est requise';
      if (confirmPassword.errors['passwordMismatch']) return 'Les mots de passe ne correspondent pas';
    }
    return '';
  }
}
