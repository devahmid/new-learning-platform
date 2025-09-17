import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Classe } from '../../models/classe.model';
import { ClasseService } from '../../services/classe.service';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { AdminUserService } from '../../services/admin-user.service';
import { Schedule } from '../../models/schedule.model';
import { ScheduleService } from '../../services/schedule.service';
import { CalendarClasseComponent } from '../../calendar-classe/calendar-classe.component';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-classes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CalendarClasseComponent
  ],
  templateUrl: './classes.component.html',
  styleUrls: ['./classes.component.scss']
})
export class ClassesComponent implements OnInit, OnDestroy {
  classes: Classe[] = [];
  newClasse: Partial<Classe> = {};
  selectedClasse: Classe | null = null;
  availableStudents: User[] = [];
  teachers: User[] = [];
  showClasseDetailsDialog = false;
  showCreateForm = false;
  showAddStudentDialog = false;
  showAddScheduleDialog = false;
  isLoading = false;
  searchTerm = '';
  newSchedule: Partial<Schedule> = {};
  days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  
  // Couleurs prédéfinies pour les classes
  predefinedColors = [
    '#3B82F6', // Blue
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Violet
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#F97316'  // Orange
  ];

  constructor(
    private classeService: ClasseService,
    private userService: UserService,
    private adminUserService: AdminUserService,
    private scheduleService: ScheduleService, 
    public auth: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadClasses();
    this.loadTeachers();
    this.resetNewClasse();
  }

  ngOnDestroy() {
    // Cleanup si nécessaire
  }

  loadClasses(): void {
    this.isLoading = true;
    this.classeService.findAll().subscribe({
      next: (classes) => {
        this.classes = classes;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des classes:', error);
        this.isLoading = false;
      }
    });
  }

  loadTeachers(): void {
    this.userService.findAll().subscribe({
      next: (users) => {
        this.teachers = users.filter(u => u.role === 'admin' || u.role === 'enseignant');
      },
      error: (error) => {
        console.error('Erreur lors du chargement des professeurs:', error);
      }
    });
  }

  openClasseDetails(classe: Classe): void {
    this.selectedClasse = classe;
    this.showClasseDetailsDialog = true;
  }

  closeClasseDetails(): void {
    this.selectedClasse = null;
    this.showClasseDetailsDialog = false;
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.resetNewClasse();
    }
  }

  resetNewClasse(): void {
    this.newClasse = {
      name: '',
      description: '',
      color: this.predefinedColors[0]
    };
  }

  createClasse(): void {
    if (!this.newClasse.name || !this.newClasse.teacher) {
      return;
    }

    this.isLoading = true;
    this.classeService.create(this.newClasse).subscribe({
      next: (createdClasse) => {
        this.classes.push(createdClasse);
        this.toggleCreateForm();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors de la création de la classe:', error);
        this.isLoading = false;
      }
    });
  }

  deleteClasse(classe: Classe): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la classe "${classe.name}" ?`)) {
      this.classeService.delete(classe.id).subscribe({
        next: () => {
          this.classes = this.classes.filter(c => c.id !== classe.id);
          if (this.selectedClasse?.id === classe.id) {
            this.closeClasseDetails();
          }
        },
        error: (error) => {
          console.error('Erreur lors de la suppression de la classe:', error);
        }
      });
    }
  }

  get filteredClasses(): Classe[] {
    if (!this.searchTerm) {
      return this.classes;
    }
    return this.classes.filter(classe =>
      classe.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      classe.description?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  get isAdmin(): boolean {
    return this.auth.role() === 'admin';
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }

  openAddStudentDialog(classe: Classe): void {
    this.selectedClasse = classe;
    this.loadAvailableStudents();
    this.showAddStudentDialog = true;
  }

  closeAddStudentDialog(): void {
    this.showAddStudentDialog = false;
    this.selectedClasse = null;
    this.availableStudents = [];
  }

  loadAvailableStudents(): void {
    this.userService.findAll().subscribe({
      next: (users) => {
        // Filtrer les élèves (type: 'child') qui ne sont pas déjà dans une classe
        this.availableStudents = users.filter(user => 
          user.type === 'child' && (!user.classe || user.classe.id !== this.selectedClasse?.id)
        );
      },
      error: (error) => {
        console.error('Erreur lors du chargement des élèves:', error);
      }
    });
  }

  addStudentToClasse(student: User): void {
    if (!this.selectedClasse) return;

    this.isLoading = true;
    this.adminUserService.patchUpdateUser(student.id, {
      classeId: this.selectedClasse.id
    }).subscribe({
      next: () => {
        // Mettre à jour la classe localement
        const classeIndex = this.classes.findIndex(c => c.id === this.selectedClasse!.id);
        if (classeIndex !== -1) {
          if (!this.classes[classeIndex].students) {
            this.classes[classeIndex].students = [];
          }
          this.classes[classeIndex].students!.push(student);
        }
        
        // Retirer l'élève de la liste des disponibles
        this.availableStudents = this.availableStudents.filter(s => s.id !== student.id);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors de l\'ajout de l\'élève:', error);
        this.isLoading = false;
      }
    });
  }

  removeStudentFromClasse(student: User): void {
    if (!this.selectedClasse) return;

    this.isLoading = true;
    this.adminUserService.patchUpdateUser(student.id, {
      classeId: null
    }).subscribe({
      next: () => {
        // Mettre à jour la classe localement
        const classeIndex = this.classes.findIndex(c => c.id === this.selectedClasse!.id);
        if (classeIndex !== -1 && this.classes[classeIndex].students) {
          this.classes[classeIndex].students = this.classes[classeIndex].students!.filter(s => s.id !== student.id);
        }
        
        // Ajouter l'élève à la liste des disponibles
        this.availableStudents.push(student);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors de la suppression de l\'élève:', error);
        this.isLoading = false;
      }
    });
  }

  openAddScheduleDialog(classe: Classe): void {
    this.selectedClasse = classe;
    this.resetNewSchedule();
    this.showAddScheduleDialog = true;
  }

  closeAddScheduleDialog(): void {
    this.showAddScheduleDialog = false;
    this.selectedClasse = null;
    this.resetNewSchedule();
  }

  resetNewSchedule(): void {
    this.newSchedule = {
      day: '',
      startHour: '',
      endHour: ''
    };
  }

  addScheduleToClasse(): void {
    if (!this.selectedClasse || !this.newSchedule.day || !this.newSchedule.startHour || !this.newSchedule.endHour) {
      return;
    }

    this.isLoading = true;
    this.scheduleService.create({
      day: this.newSchedule.day,
      startHour: this.newSchedule.startHour,
      endHour: this.newSchedule.endHour,
      classeId: this.selectedClasse.id
    }).subscribe({
      next: (createdSchedule) => {
        // Mettre à jour la classe localement
        const classeIndex = this.classes.findIndex(c => c.id === this.selectedClasse!.id);
        if (classeIndex !== -1) {
          if (!this.classes[classeIndex].schedules) {
            this.classes[classeIndex].schedules = [];
          }
          this.classes[classeIndex].schedules!.push(createdSchedule);
        }
        
        this.closeAddScheduleDialog();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors de l\'ajout du créneau:', error);
        this.isLoading = false;
      }
    });
  }

  deleteSchedule(schedule: Schedule): void {
    if (!this.selectedClasse) return;

    if (confirm(`Êtes-vous sûr de vouloir supprimer ce créneau ?`)) {
      this.isLoading = true;
      this.scheduleService.delete(schedule.id).subscribe({
        next: () => {
          // Mettre à jour la classe localement
          const classeIndex = this.classes.findIndex(c => c.id === this.selectedClasse!.id);
          if (classeIndex !== -1 && this.classes[classeIndex].schedules) {
            this.classes[classeIndex].schedules = this.classes[classeIndex].schedules!.filter(s => s.id !== schedule.id);
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erreur lors de la suppression du créneau:', error);
          this.isLoading = false;
        }
      });
    }
  }
}