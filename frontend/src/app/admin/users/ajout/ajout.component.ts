import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminUserService } from '../../../services/admin-user.service';
import { LevelService } from '../../../services/level.service';
import { User } from '../../../models/user.model';
import { Level } from '../../../models/level.model';

@Component({
    selector: 'app-ajout',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './ajout.component.html',
    styleUrl: './ajout.component.scss'
})
export class AjoutComponent implements OnInit {
    userForm: FormGroup;
    isLoading = false;
    isSubmitting = false;
    showSuccessMessage = false;
    showErrorMessage = false;
    errorMessage = '';
    successMessage = '';
    
    // Types d'utilisateurs
    userTypes = [
        { value: 'parent', label: 'Parent', icon: 'fa-solid fa-user-friends' },
        { value: 'child', label: 'Enfant', icon: 'fa-solid fa-child' }
    ];
    
    // Rôles disponibles
    roles = [
        { value: 'user', label: 'Utilisateur', color: 'bg-blue-100 text-blue-800' },
        { value: 'admin', label: 'Administrateur', color: 'bg-red-100 text-red-800' },
        { value: 'modérateur', label: 'Modérateur', color: 'bg-green-100 text-green-800' }
    ];
    
    // Niveaux pour les enfants
    levels: Level[] = [];
    levelsLoading = false;
    
    // État du formulaire
    selectedUserType = 'parent';
    showPasswordField = true;

    constructor(
        private fb: FormBuilder,
        private adminUserService: AdminUserService,
        private levelService: LevelService,
        private router: Router
    ) {
        this.userForm = this.createForm();
    }

    ngOnInit(): void {
        this.loadLevels();
        this.setupFormSubscriptions();
    }

    createForm(): FormGroup {
        return this.fb.group({
            type: ['parent', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            firstName: ['', [Validators.required, Validators.minLength(2)]],
            lastName: ['', [Validators.required, Validators.minLength(2)]],
            phoneNumber: [''],
            dateOfBirth: [''],
            role: ['user', Validators.required],
            levelId: [null]
        });
    }

    setupFormSubscriptions(): void {
        // Écouter les changements de type d'utilisateur
        this.userForm.get('type')?.valueChanges.subscribe(type => {
            this.selectedUserType = type;
            this.updateFormValidation(type);
        });
    }

    updateFormValidation(userType: string): void {
        const dateOfBirthControl = this.userForm.get('dateOfBirth');
        const levelIdControl = this.userForm.get('levelId');
        
        if (userType === 'child') {
            dateOfBirthControl?.setValidators([Validators.required]);
            levelIdControl?.setValidators([Validators.required]);
        } else {
            dateOfBirthControl?.clearValidators();
            levelIdControl?.clearValidators();
        }
        
        dateOfBirthControl?.updateValueAndValidity();
        levelIdControl?.updateValueAndValidity();
    }

    loadLevels(): void {
        this.levelsLoading = true;
        this.levelService.getAll().subscribe({
            next: (levels: Level[]) => {
                this.levels = levels;
                this.levelsLoading = false;
            },
            error: (error: any) => {
                console.error('Erreur lors du chargement des niveaux:', error);
                this.levelsLoading = false;
            }
        });
    }

    onUserTypeChange(type: string): void {
        this.selectedUserType = type;
        this.userForm.patchValue({ type });
    }

    onSubmit(): void {
        if (this.userForm.valid && !this.isSubmitting) {
            this.isSubmitting = true;
            this.hideMessages();
            
            const formData = this.userForm.value;
            
            // Préparer les données selon le type d'utilisateur
            const userData = {
                ...formData,
                // Nettoyer les champs vides
                phoneNumber: formData.phoneNumber || null,
                dateOfBirth: formData.dateOfBirth || null,
                levelId: formData.levelId || null
            };
            
            console.log('Données à envoyer:', userData);
            
            // Appel au service admin
            this.adminUserService.createUser(userData).subscribe({
                next: (response) => {
                    console.log('Utilisateur créé avec succès:', response);
                    this.showSuccessMessage = true;
                    this.successMessage = `Utilisateur ${userData.firstName} ${userData.lastName} créé avec succès !`;
                    this.isSubmitting = false;
                    
                    // Réinitialiser le formulaire après 2 secondes
                    setTimeout(() => {
                        this.resetForm();
                        this.router.navigate(['/admin/users/list']);
                    }, 2000);
                },
                error: (error) => {
                    console.error('Erreur lors de la création:', error);
                    this.showErrorMessage = true;
                    this.errorMessage = error.error?.message || 'Erreur lors de la création de l\'utilisateur';
                    this.isSubmitting = false;
                }
            });
        } else {
            this.markFormGroupTouched();
        }
    }

    resetForm(): void {
        this.userForm.reset();
        this.userForm.patchValue({
            type: 'parent',
            role: 'user'
        });
        this.selectedUserType = 'parent';
        this.hideMessages();
    }

    goBack(): void {
        this.router.navigate(['/admin/users']);
    }

    hideMessages(): void {
        this.showSuccessMessage = false;
        this.showErrorMessage = false;
        this.errorMessage = '';
        this.successMessage = '';
    }

    markFormGroupTouched(): void {
        Object.keys(this.userForm.controls).forEach(key => {
            const control = this.userForm.get(key);
            control?.markAsTouched();
        });
    }

    // Getters pour la validation
    get email() { return this.userForm.get('email'); }
    get password() { return this.userForm.get('password'); }
    get firstName() { return this.userForm.get('firstName'); }
    get lastName() { return this.userForm.get('lastName'); }
    get phoneNumber() { return this.userForm.get('phoneNumber'); }
    get dateOfBirth() { return this.userForm.get('dateOfBirth'); }
    get role() { return this.userForm.get('role'); }
    get levelId() { return this.userForm.get('levelId'); }
}
