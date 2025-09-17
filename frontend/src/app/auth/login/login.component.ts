import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { AuthService } from '../auth.service';
import { Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';
import { adminGuard } from '../auth.guard';
import { CommonModule } from '@angular/common';
import { UserValidationService } from '../../services/user-validation.service';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, InputTextModule, PasswordModule, ButtonModule, CardModule, ToastModule, MessageModule],
  providers: [],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService,
    private userValidationService: UserValidationService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // login() {
  //   if (this.loginForm.invalid) {
  //     this.errorMessage = "Veuillez remplir correctement tous les champs.";
  //     return;
  //   }

  //   this.authService.login(this.loginForm.value).subscribe({
  //     next: (response) => {
  //       console.log(  'response ', response)
  //       this.messageService.add({ severity: 'success', summary: 'Connexion réussie' });
  //       this.authService.setToken(response.access_token);

  //       setTimeout(() => {
  //         this.router.navigate(['/matières']);
  //       }, 500); 
  //     },
  //     error: (err) => {
  //       console.error("Erreur lors de la connexion :", err);
  //       this.errorMessage = err.error.message || "Email ou mot de passe incorrect.";
  //     }
  //   });
  // }

  login() {
    if (this.loginForm.invalid) {
      this.errorMessage = "Veuillez remplir correctement tous les champs.";
      return;
    }
    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.messageService.add({ severity: 'success', summary: 'Connexion réussie' });
        
        // Initialiser le statut de validation après connexion
        this.userValidationService.initStatusAfterLogin();
        
        // Vérifier le statut de l'utilisateur
        const user = this.authService.getCurrentUser();
        user.subscribe(userData => {
          if (userData?.status === 'pending') {
            // Rediriger vers la page d'attente
            this.router.navigate(['/waiting-approval']);
          } else if (userData?.status === 'rejected') {
            // Rediriger vers la page de compte rejeté
            this.router.navigate(['/account-rejected']);
          } else {
            // Utilisateur approuvé, rediriger vers la sélection des enfants
            setTimeout(() => this.router.navigate(['/no-children-info']), 500);
          }
        });
      },
      error: (err) => {
        console.error("Erreur lors de la connexion :", err);
        this.errorMessage = err.error.message || "Email ou mot de passe incorrect.";
      }
    });

  }

}
