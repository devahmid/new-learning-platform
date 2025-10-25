import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../auth.service';

@Component({
    selector: 'app-register',
    standalone:true,
    imports: [CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        InputTextModule,
        PasswordModule,
        ButtonModule,
        ToastModule,
        DropdownModule,
        CardModule,
        MessageModule],
    templateUrl: './register.component.html',
    providers: []
})
export class RegisterComponent {
  user = { nom: '', email: '', motDePasse: '', role: 'ETUDIANT' };
  errorMessage: string = '';
  roles = [
    { label: 'Étudiant', value: 'ETUDIANT' },
    { label: 'Enseignant', value: 'ENSEIGNANT' }
  ];
  registerForm!: FormGroup;


  constructor(private authService: AuthService, private router: Router, private messageService: MessageService) {
    this.registerForm = new FormBuilder().group({
  email: ['', [Validators.required, Validators.email]],
  password: ['', [Validators.required, Validators.minLength(6)]],
  confirmPassword: ['', Validators.required],
  firstName: ['', Validators.required],
  lastName: ['', Validators.required],
  phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[1-9]\d{1,14}$/)]], // format international
}, { validators: this.passwordMatchValidator() });

    
    
  }

  passwordMatchValidator(): ValidatorFn {
  return (control: AbstractControl) => {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  };
}

  register() {
    if (this.registerForm.invalid) {
      this.errorMessage = "Veuillez remplir tous les champs correctement.";
      return;
    }
  const payload = { 
    ...this.registerForm.value,
    type: 'parent' // Ajouter le type par défaut
  };
delete payload.confirmPassword;
    this.authService.register(payload).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Inscription réussie', detail: 'Vous pouvez vous connecter.' });
        this.registerForm.reset();
        setTimeout(() => this.router.navigate(['/login']), 500);
      },
      error: (err) => {
        console.error("Erreur lors de l'inscription :", err);
        this.errorMessage = 'Erreur lors de l’inscription. Veuillez réessayer.';
      }
    });
  }
  
  
  
}
