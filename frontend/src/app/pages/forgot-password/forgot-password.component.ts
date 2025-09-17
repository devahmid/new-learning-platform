import { CommonModule } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { MessageService } from "primeng/api";
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { Component } from "@angular/core";
import { AuthService } from "../../auth/auth.service";
import { RouterModule } from "@angular/router";


@Component({
    selector: 'app-forgot-password',
    standalone:true,
    imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, RouterModule],
    templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent {
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  success = false;
  error = false;
  successMessage = '';
  errorMessage = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private message: MessageService
  ) {}

  submit() {
    if (this.form.invalid) return;

    this.isLoading = true;
    this.success = false;
    this.error = false;
    this.successMessage = '';
    this.errorMessage = '';

    const email = this.form.value.email!;
    this.authService.requestPasswordReset(email).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.success = true;
        
        // Afficher le message reçu de l'API
        if (response && response.message) {
          this.successMessage = response.message;
        } else {
          this.successMessage = 'Si cet email existe, un lien de réinitialisation a été envoyé.';
        }
        
        this.message.add({ 
          severity: 'success', 
          summary: 'Demande envoyée', 
          detail: this.successMessage 
        });
        this.form.reset();
      },
      error: (error) => {
        this.isLoading = false;
        this.error = true;
        
        // Afficher le message d'erreur reçu de l'API
        if (error.error && error.error.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'Une erreur est survenue lors de l\'envoi de la demande.';
        }
        
        this.message.add({ 
          severity: 'error', 
          summary: 'Erreur', 
          detail: this.errorMessage 
        });
      }
    });
  }
}

