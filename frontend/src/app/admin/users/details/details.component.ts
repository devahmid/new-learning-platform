import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../../../models/user.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { AdminUserService } from '../../../services/admin-user.service';
import { ClasseService } from '../../../services/classe.service';

@Component({
    selector: 'app-details',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './details.component.html',
    styleUrl: './details.component.scss'
})
export class DetailsComponent implements OnInit {
    @Input() user!: User;
    isEditing = false;
    editedUser: User | null = null;
    loading = false;
    childrenLoading = false;
    showChildren = true;
    
    // Modals
    showChildModal = false;
    showEditChildModal = false;
    showCreateChildModal = false;
    selectedChild: User | null = null;
    newChild: Partial<User> = {};
    
    // Notifications
    showNotification = false;
    notificationMessage = '';
    notificationType: 'success' | 'error' = 'success';
    
    // Niveaux
    classes: any[] = [];
    classesLoading = false;

    constructor(
        private route: ActivatedRoute, 
        private userService: UserService, 
        private adminUserService: AdminUserService,
        private classeService: ClasseService,
        private router: Router
    ) {}

    ngOnInit() {
        const idParam = this.route.snapshot.paramMap.get('id')!;
        const id = Number(idParam);
        this.loading = true;
        
        // Utiliser le service admin pour récupérer les détails
        this.adminUserService.getUserById(id).subscribe({
            next: (user) => {
                this.user = user;
                this.editedUser = { 
                    ...user,
                    classe: user.classe ? { ...user.classe } : { id: 0, name: '' }
                };
                this.loading = false;
                
                // Si c'est un parent, vérifier et charger les enfants si nécessaire
                if (user.type === 'parent') {
                    this.loadChildrenIfNeeded();
                }
            },
            error: (error) => {
                console.error('Erreur lors du chargement de l\'utilisateur:', error);
                this.loading = false;
            }
        });
    }

    private loadChildrenIfNeeded() {
        // Les enfants sont déjà chargés avec la méthode getUserById du service admin
        // qui utilise findById avec les relations ['level', 'children', 'parentProfile', 'payments']
        console.log('Enfants chargés:', this.user.children);
    }

    getRoleBadgeClass(role: string): string {
        switch (role) {
            case 'admin':
                return 'bg-red-100 text-red-800';
            case 'parent':
                return 'bg-blue-100 text-blue-800';
            case 'child':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    }

    getRoleLabel(role: string): string {
        switch (role) {
            case 'admin':
                return 'Administrateur';
            case 'parent':
                return 'Parent';
            case 'child':
                return 'Enfant';
            default:
                return 'Utilisateur';
        }
    }

    startEditing() {
        this.isEditing = true;
        this.editedUser = { 
            ...this.user,
            classe: this.user.classe ? { ...this.user.classe } : { id: 0, name: '' }
        };
    }

    cancelEditing() {
        this.isEditing = false;
        this.editedUser = { 
            ...this.user,
            classe: this.user.classe ? { ...this.user.classe } : { id: 0, name: '' }
        };
    }

    saveChanges() {
        if (!this.editedUser) return;
        
        this.loading = true;
        
        // Utiliser le service admin avec la méthode intelligente
        this.adminUserService.updateUserSmart(this.editedUser.id, this.editedUser).subscribe({
            next: (updatedUser) => {
                this.user = updatedUser;
                this.isEditing = false;
                this.loading = false;
            },
            error: (error) => {
                console.error('Erreur lors de la mise à jour:', error);
                this.loading = false;
            }
        });
    }

    goBack() {
        this.router.navigate(['/admin/users']);
    }

    updateClasseName(value: string) {
        if (this.editedUser) {
            this.editedUser.classe = { ...this.editedUser.classe, name: value, id: this.editedUser.classe?.id || 0 };
        }
    }

    toggleChildrenSection() {
        this.showChildren = !this.showChildren;
    }

    refreshChildren() {
        if (this.user.type === 'parent') {
            this.childrenLoading = true;
            
            // Recharger l'utilisateur complet avec les enfants via le service admin
            this.adminUserService.getUserById(this.user.id).subscribe({
                next: (user) => {
                    this.user = user;
                    this.childrenLoading = false;
                    console.log('Enfants rechargés:', this.user.children);
                },
                error: (error) => {
                    console.error('Erreur lors du rechargement des enfants:', error);
                    this.childrenLoading = false;
                }
            });
        }
    }

    getChildrenCount(): number {
        return this.user.children?.length || 0;
    }

    getAgeFromBirthDate(birthDate: string | undefined): number | null {
        if (!birthDate) return null;
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    }

    formatDate(date: string | undefined): string {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('fr-FR');
    }

    // Méthodes pour les actions des enfants
    viewChild(child: User) {
        this.selectedChild = child;
        this.showChildModal = true;
    }

    editChild(child: User) {
        this.selectedChild = child;
        this.showEditChildModal = true;
    }

    createNewChild() {
        // Initialiser le nouvel enfant avec des valeurs par défaut
        this.newChild = {
            type: 'child',
            firstName: '',
            lastName: '',
            email: '',
            dateOfBirth: '',
            classe: { id: 0, name: '' }
        };
        
        // Charger les classes si pas déjà chargées
        if (this.classes.length === 0) {
            this.loadClasses();
        }
        
        this.showCreateChildModal = true;
    }

    closeChildModal() {
        this.showChildModal = false;
        this.selectedChild = null;
    }

    closeEditChildModal() {
        this.showEditChildModal = false;
        this.selectedChild = null;
    }

    closeCreateChildModal() {
        this.showCreateChildModal = false;
        this.newChild = {};
    }

    onChildUpdated() {
        if (!this.selectedChild) return;
        
        this.loading = true;
        
        // Utiliser le service admin pour mettre à jour l'enfant
        this.adminUserService.updateChild(this.selectedChild.id, this.selectedChild).subscribe({
            next: (updatedChild) => {
                console.log('Enfant mis à jour avec succès:', updatedChild);
                
                // Mettre à jour l'enfant dans la liste locale
                if (this.user.children) {
                    const index = this.user.children.findIndex(child => child.id === this.selectedChild!.id);
                    if (index !== -1) {
                        this.user.children[index] = updatedChild;
                    }
                }
                
                this.loading = false;
                this.closeEditChildModal();
                
                // Afficher un message de succès
                this.showSuccessNotification('Enfant mis à jour avec succès !');
            },
            error: (error) => {
                console.error('Erreur lors de la mise à jour de l\'enfant:', error);
                this.loading = false;
                
                // Afficher un message d'erreur
                this.showErrorNotification('Erreur lors de la mise à jour de l\'enfant');
            }
        });
    }

    updateChildClasseName(value: string) {
        if (this.selectedChild) {
            this.selectedChild.classe = { ...this.selectedChild.classe, name: value, id: this.selectedChild.classe?.id || 0 };
        }
    }

    // Méthodes de notification
    showSuccessNotification(message: string) {
        this.notificationMessage = message;
        this.notificationType = 'success';
        this.showNotification = true;
        
        // Masquer automatiquement après 3 secondes
        setTimeout(() => {
            this.showNotification = false;
        }, 3000);
    }

    showErrorNotification(message: string) {
        this.notificationMessage = message;
        this.notificationType = 'error';
        this.showNotification = true;
        
        // Masquer automatiquement après 5 secondes
        setTimeout(() => {
            this.showNotification = false;
        }, 5000);
    }

    closeNotification() {
        this.showNotification = false;
    }

    // Charger les niveaux
    loadClasses() {
        this.classesLoading = true;
        
        // Utiliser le service ClasseService pour récupérer les classes
        this.classeService.getAllClasses().subscribe({
            next: (classes: any[]) => {
                this.classes = classes;
                this.classesLoading = false;
            },
            error: (error: any) => {
                console.error('Erreur lors du chargement des classes:', error);
                this.classesLoading = false;
                this.showErrorNotification('Erreur lors du chargement des classes');
            }
        });
    }

    // Créer un nouvel enfant
    onCreateChild() {
        console.log('onCreateChild appelé');
        console.log('newChild:', this.newChild);
        console.log('user:', this.user);
        
        if (!this.newChild.firstName || !this.newChild.lastName) {
            console.log('Validation échouée: prénom ou nom manquant');
            this.showErrorNotification('Le prénom et le nom sont obligatoires');
            return;
        }
        
        if (!this.newChild.level?.name && !this.newChild.level?.id) {
            console.log('Validation échouée: niveau manquant');
            this.showErrorNotification('Le niveau est obligatoire pour un enfant');
            return;
        }

        console.log('Validation réussie, début de la création');
        this.loading = true;

        // Préparer les données pour la création d'enfant
        const childData = {
            parentId: this.user.id,
            firstName: this.newChild.firstName,
            lastName: this.newChild.lastName,
            email: this.newChild.email || '',
            dateOfBirth: this.newChild.dateOfBirth || '',
            classe: this.newChild.classe?.name || '',
            classeId: this.newChild.classe?.id || null
        };

        console.log('Données à envoyer:', childData);

        // Utiliser le service admin pour créer l'enfant
        this.adminUserService.createChild(childData).subscribe({
            next: (createdChild) => {
                console.log('Enfant créé avec succès:', createdChild);
                
                // Ajouter l'enfant à la liste locale
                if (!this.user.children) {
                    this.user.children = [];
                }
                this.user.children.push(createdChild);
                
                this.loading = false;
                this.closeCreateChildModal();
                
                // Afficher un message de succès
                this.showSuccessNotification('Enfant créé avec succès !');
            },
            error: (error) => {
                console.error('Erreur lors de la création de l\'enfant:', error);
                this.loading = false;
                
                // Afficher un message d'erreur
                this.showErrorNotification('Erreur lors de la création de l\'enfant');
            }
        });
    }

    updateNewChildClasseName(value: string) {
        if (this.newChild) {
            this.newChild.classe = { ...this.newChild.classe, name: value, id: this.newChild.classe?.id || 0 };
        }
    }

    selectClasse(classe: any) {
        if (this.newChild) {
            this.newChild.classe = { id: classe.id, name: classe.name };
        }
    }

    onClasseChange(classeId: string | number) {
        console.log('onClasseChange appelé avec classeId:', classeId, 'type:', typeof classeId);
        console.log('classes disponibles:', this.classes);
        
        // Convertir classeId en number si c'est une string
        const numericClasseId = typeof classeId === 'string' ? parseInt(classeId, 10) : classeId;
        console.log('classeId converti en number:', numericClasseId);
        
        const selectedClasse = this.classes.find(c => c.id === numericClasseId);
        console.log('classe sélectionnée:', selectedClasse);
        
        if (selectedClasse && this.newChild) {
            this.newChild.classe = { id: selectedClasse.id, name: selectedClasse.name };
            console.log('newChild.classe mis à jour:', this.newChild.classe);
        }
    }
}
