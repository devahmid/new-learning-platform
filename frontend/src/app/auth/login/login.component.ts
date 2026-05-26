import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { AuthService } from '../auth.service';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
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
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string = '';
  sessionMessage: string = '';
  returnUrl = '/no-children-info';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private userValidationService: UserValidationService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    // Vérifier s'il y a des paramètres de redirection (token expiré, etc.)
    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '/no-children-info';
      if (params['reason'] === 'token-expired') {
        this.sessionMessage = params['message'] || 'Votre session a expiré. Veuillez vous reconnecter.';
        this.messageService.add({ 
          severity: 'warn', 
          summary: 'Session expirée', 
          detail: this.sessionMessage 
        });
      } else if (params['reason'] === 'invalid-token') {
        this.sessionMessage = params['message'] || 'Token invalide. Veuillez vous reconnecter.';
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Session invalide', 
          detail: this.sessionMessage 
        });
      } else if (params['reason'] === 'token-error') {
        this.sessionMessage = params['message'] || 'Erreur de session. Veuillez vous reconnecter.';
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Erreur de session', 
          detail: this.sessionMessage 
        });
      }
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
          } else if (this.returnUrl && this.returnUrl !== '/no-children-info') {
            this.router.navigateByUrl(this.returnUrl, { skipLocationChange: false });
          } else {
            // Utilisateur approuvé, rediriger vers la sélection des enfants
            setTimeout(() => this.router.navigate(['/no-children-info']), 500);
          }
        });
      },
      error: (err) => {
        console.error("Erreur lors de la connexion :", err);
        
        // Gestion spécifique des erreurs de connexion
        if (err.status === 401) {
          this.errorMessage = "Email ou mot de passe incorrect.";
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Erreur de connexion', 
            detail: 'Email ou mot de passe incorrect.' 
          });
        } else if (err.status === 403) {
          this.errorMessage = "Compte non autorisé ou suspendu.";
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Accès refusé', 
            detail: 'Votre compte n\'est pas autorisé à se connecter.' 
          });
        } else if (err.status === 0 || err.status >= 500) {
          this.errorMessage = "Erreur de connexion au serveur. Veuillez réessayer.";
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Erreur serveur', 
            detail: 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.' 
          });
        } else {
          this.errorMessage = err.error?.message || "Une erreur inattendue s'est produite.";
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Erreur de connexion', 
            detail: this.errorMessage 
          });
        }
      }
    });

  }

}
