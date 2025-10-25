import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  ValidatorFn,
  AbstractControl,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { PasswordModule } from 'primeng/password';
import { FicheEnfantComponent } from '../../fiche-enfant/fiche-enfant.component';
import { PaymentComponent } from '../../payment/payment.component';
import { PaymentPageComponent } from '../../payment/components/payment-page.component';
import { StripeElementsComponent } from '../../stripe-elements/stripe-elements.component';
import { PaymentPopupComponent } from '../../payment-popup/payment-popup.component';
import { CalendarClasseComponent } from '../../calendar-classe/calendar-classe.component';
import { ClasseService } from '../../services/classe.service';
import { BadgeModule } from 'primeng/badge';
import { ChildContextService } from '../../_children-context/_children-context/child-context.service';
import { CreateChildPayload } from '../../models/payloads';
import { CheckboxModule } from 'primeng/checkbox';
import { MultiSelectModule } from 'primeng/multiselect';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ApiPaths } from '../../shared/api-paths';
import { CourseService } from '../../services/course.service';
import { PaymentService } from '../../services/payment.service';
import { AssignmentService, Assignment, ParentAssignmentsResponse } from '../../services/assignment.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [ConfirmationService],
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    DialogModule,
    ReactiveFormsModule,
    InputTextModule,
    FormsModule,
    ConfirmDialogModule,
    DropdownModule,
    PasswordModule,
    FicheEnfantComponent,
    PaymentComponent,
    PaymentPageComponent,
    CalendarClasseComponent,
    BadgeModule,
    CheckboxModule,
    MultiSelectModule,
    RadioButtonModule,
  ],
  templateUrl: './user-dashboard.component.html',
})
export class UserDashboardComponent implements OnInit {
  fullName: string | null = null;
  email: string | null = null;
  role: string | null = null;
  type: string | null = null;
  phoneNumber: string | null = null;
  address: string | null = null;
  dateOfBirth: string | null = null;
  id: number | null = null;
  selectedLevel: any = null;
  selectedLevelId: number | null = null;
  selectedLevelName: string | null = null;
  selectedLevelType: string | null = null;
  selectedLevelDate: string | null = null;
  selectedChildId: number | null = null;
  levels: any[] = [];
  user: any;
  selectedChild: any = null;

  // Statistiques de quiz
  quizStats: any = null;
  
  // Gestion des retours de paiement
  paymentStatus: 'success' | 'cancel' | null = null;
  paymentSessionId: string | null = null;
  isLoadingQuizStats = false;

  // Historique des paiements
  paymentHistory: any[] = [];
  isLoadingPaymentHistory = false;

  // Données pour les sessions Zoom
  upcomingSessions: any[] = [];
  isLoadingSessions = false;

  // URL unique de la salle Zoom (une seule salle pour tous les cours)
  zoomUrl = 'https://us02web.zoom.us/j/2432586827?pwd=RkpwaVhlcElXWjQxZmt6UkI5SmRiQT09';

  // Données pour les devoirs
  assignments: any[] = [];
  assignmentsLoading = false;
  assignmentsError: string | null = null;

  // Type pour les sections du dashboard
  private readonly sectionTypes = [
    'overview',
    'children',
    'courses',
    'zoom',
    'payment',
    'stats',
    'settings',
  ];

  // Calculs dynamiques des statistiques
  get coursesDone(): number {
    return this.user?.payments?.length || 0;
  }

  get quizzesCompleted(): number {
    return this.quizStats?.stats?.totalQuizzes || 0;
  }

  get averageQuizScore(): number {
    return Math.round(this.quizStats?.stats?.averageScore || 0);
  }

  get bestQuizScore(): number {
    return this.quizStats?.stats?.bestScore || 0;
  }

  get overallProgress(): number {
    if (!this.user?.lessonProgress?.length) return 0;
    const totalLessons = this.user.lessonProgress.length;
    const completedLessons = this.user.lessonProgress.filter(
      (lp: any) => lp.progress >= 100
    ).length;
    return Math.round((completedLessons / totalLessons) * 100);
  }

  // Score de santé du compte (0-100)
  get accountHealthScore(): number {
    let score = 0;

    // Profil complet : +30 points
    if (this.profilComplet) score += 30;

    // Enfants inscrits : +20 points
    if (this.children.length > 0) score += 20;

    // Activité récente : +25 points
    if (this.overallProgress > 0) score += 25;

    // Paiements : +25 points
    if (this.coursesDone > 0) score += 25;

    return Math.min(score, 100);
  }

  // Niveau de santé du compte
  get accountHealthLevel(): string {
    const score = this.accountHealthScore;
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'bon';
    if (score >= 40) return 'moyen';
    if (score >= 20) return 'faible';
    return 'critique';
  }

  // Système de badges et achievements
  get achievements(): any[] {
    const badges = [];

    // Badge profil complet
    if (this.profilComplet) {
      badges.push({
        id: 'profile-complete',
        name: 'Profil Parfait',
        description: 'Profil complètement rempli',
        icon: 'pi pi-user-check',
        color: 'emerald',
        unlocked: true,
        date: new Date(),
      });
    }

    // Badge premier enfant
    if (this.children.length > 0) {
      badges.push({
        id: 'first-child',
        name: 'Premier Pas',
        description: 'Premier enfant inscrit',
        icon: 'pi pi-users',
        color: 'blue',
        unlocked: true,
        date: new Date(),
      });
    }

    // Badge cours commencé
    if (this.overallProgress > 0) {
      badges.push({
        id: 'course-started',
        name: 'Étudiant Débutant',
        description: 'Premier cours commencé',
        icon: 'pi pi-book',
        color: 'green',
        unlocked: true,
        date: new Date(),
      });
    }

    // Badge paiement effectué
    if (this.coursesDone > 0) {
      badges.push({
        id: 'payment-made',
        name: 'Investisseur',
        description: 'Premier paiement effectué',
        icon: 'pi pi-credit-card',
        color: 'purple',
        unlocked: true,
        date: new Date(),
      });
    }

    // Badge progression avancée
    if (this.overallProgress >= 50) {
      badges.push({
        id: 'advanced-progress',
        name: 'Progression Avancée',
        description: '50% de progression atteint',
        icon: 'pi pi-chart-line',
        color: 'orange',
        unlocked: true,
        date: new Date(),
      });
    }

    // Badge quiz maître
    if (this.quizzesCompleted >= 5) {
      badges.push({
        id: 'quiz-master',
        name: 'Maître des Quiz',
        description: '5 quiz terminés',
        icon: 'pi pi-question-circle',
        color: 'red',
        unlocked: true,
        date: new Date(),
      });
    }

    return badges;
  }

  // Badges à débloquer (pour motivation)
  get lockedAchievements(): any[] {
    return [
      {
        id: 'profile-complete',
        name: 'Profil Parfait',
        description: 'Complétez votre profil',
        icon: 'pi pi-user-check',
        color: 'gray',
        unlocked: false,
        requirement: 'Remplir toutes les informations',
      },
      {
        id: 'first-child',
        name: 'Premier Pas',
        description: 'Inscrire un enfant',
        icon: 'pi pi-users',
        color: 'gray',
        unlocked: false,
        requirement: 'Ajouter un enfant',
      },
      {
        id: 'course-started',
        name: 'Étudiant Débutant',
        description: 'Commencer un cours',
        icon: 'pi pi-book',
        color: 'gray',
        unlocked: false,
        requirement: 'Suivre une leçon',
      },
    ].filter((badge) => !this.achievements.find((a) => a.id === badge.id));
  }

  childDetailsDialog = false;
  editInfosDialog = false;
  addChildDialog = false;
  editChildDialog = false;
  passwordDialog = false;

  editForm: FormGroup;
  editChildForm!: FormGroup;
  passwordForm!: FormGroup;

  children: any[] = [];
  mesClasses: any = [];
  classes: any[] = []; // ✅ Ajouter la liste des classes
  childContext = inject(ChildContextService);
  private paymentService = inject(PaymentService);

  // Propriétés pour le mode focus
  isFocusMode = signal(false);
  focusTimer = signal(0);
  focusInterval: any = null;

  // Formatage du temps de focus
  get focusTimeFormatted(): string {
    const minutes = Math.floor(this.focusTimer() / 60);
    const seconds = this.focusTimer() % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }

  // Propriétés pour le formulaire
  isSubmitting = false;

  // États de chargement
  isLoading = false;
  isUpdating = false;
  isDeleting = false;

  // Système de thème
  isDarkMode = signal(false);
  currentTheme = signal<'light' | 'dark'>('light');

  // ViewChild pour les graphiques

  // Pour le multiselect “platforms”
  platformOptions = [
    { label: 'WhatsApp', value: 'WhatsApp' },
    { label: 'Telegram', value: 'Telegram' },
    { label: 'Signal', value: 'Signal' },
    { label: 'Autre', value: 'Autre' },
  ];

  groupOptions = [
    { label: 'Groupe classe (infos hebdomadaires)', value: 'classe' },
    { label: 'Groupe général (annonces importantes)', value: 'general' },
    { label: 'Diffusion privée (infos individuelles)', value: 'privee' },
    { label: 'Je préfère uniquement les e-mails', value: 'email' },
  ];

  timeSlotOptions = [
    { label: 'Mercredi matin (9h–12h)', value: 'mercredi-matin' },
    { label: 'Mercredi après-midi (13h–17h)', value: 'mercredi-apres-midi' },
    { label: 'Samedi matin (9h–12h)', value: 'samedi-matin' },
    { label: 'Samedi après-midi (13h–17h)', value: 'samedi-apres-midi' },
    { label: 'Dimanche matin (9h–12h)', value: 'dimanche-matin' },
    { label: 'Dimanche après-midi (13h–17h)', value: 'dimanche-apres-midi' },
  ];

  arabicLevelOptions = [
    { label: 'Débutant complet', value: 'debutant' },
    { label: 'Lecture simple avec voyelles', value: 'lecture' },
    { label: 'Lecture fluide sans voyelles', value: 'fluide' },
    { label: 'Écriture autonome', value: 'ecriture' },
  ];

  // Pour la liste des handicaps
  disabilityOptions = [
    { label: 'Dyslexie', value: 'dyslexie' },
    { label: 'TDAH', value: 'tdah' },
    // etc.
  ];

  constructor(
    private auth: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private classeService: ClasseService,
    private http: HttpClient,
    private courseService: CourseService,
    private assignmentService: AssignmentService
  ) {
    effect(() => {
      const user = this.auth.user();
      this.user = user;
      this.fullName = this.auth.fullName();
      this.email = this.auth.email();
      this.role = this.auth.role();
      this.type = this.auth.type();
      this.phoneNumber = this.auth.phoneNumber();
      this.address = this.auth.address();
      this.dateOfBirth = this.auth.dateOfBirth();
    });
    this.editForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phoneNumber: ['', Validators.pattern(/^\+33[1-9]\d{8}$/)],
      secondaryPhone: [''],
      platforms: [[]],
      preferredGroups: [[]],
      emailOnly: [false],
    });

    this.editChildForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      classeId: [null, Validators.required], // ✅ Changé de levelId à classeId
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    });

    // Formulaire de préférences supprimé
  }

  ngOnInit() {
    // Récupérer l'ID utilisateur depuis AuthService
    this.id = this.auth.id();
    
    this.loadChildren();
    this.loadLevels();
    this.loadQuizStats();
    this.loadClasses(); // ✅ Ajouter le chargement des classes
    this.loadPaymentHistory(); // ✅ Charger l'historique des paiements
    this.loadUpcomingSessions(); // ✅ Charger les sessions Zoom depuis le planning
    this.setupKeyboardShortcuts();
    this.initTheme();
    this.setupPushNotifications();
    this.initAnalyticsData();
    // loadUserPreferences() supprimé - section préférences supprimée
    
    // Gestion des retours de paiement
    this.handlePaymentReturn();

    setTimeout(() => {

      // Vérifier et célébrer les accomplissements
      this.checkAndCelebrateAccomplishments();
    }, 1000);

    // Popup automatique de modification des infos supprimée
    // L'utilisateur peut maintenant modifier ses infos manuellement via le bouton "Modifier"

    this.route.queryParams.subscribe((params) => {
      const status = params['status'];
      const section = params['section'];
      
      if (status === 'success') {
        this.messageService.add({
          severity: 'success',
          summary: 'Paiement validé ✅',
          detail: 'Votre paiement a été enregistré avec succès.',
        });
      } else if (status === 'failed') {
        this.messageService.add({
          severity: 'error',
          summary: 'Paiement annulé ❌',
          detail: 'Le paiement a échoué ou a été annulé.',
        });
      }
      
      // Activer la section Zoom si demandée via URL
      if (section === 'zoom') {
        this.activeSection = 'zoom';
      } else if (section === undefined && this.activeSection === 'zoom') {
        // Si pas de paramètre section et qu'on était sur zoom, revenir à overview
        this.activeSection = 'overview';
      }
    });

    this.classeService.findAll().subscribe((res) => {
      this.mesClasses = res;
    });
  }

  // Gestion centralisée des erreurs
  private handleError(error: any, action: string): void {
    console.error(`Erreur lors de ${action}:`, error);
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail: `Une erreur est survenue lors de ${action}. Veuillez réessayer.`,
      life: 5000,
    });
  }

  // Gestion des succès
  private handleSuccess(message: string): void {
    this.messageService.add({
      severity: 'success',
      summary: '✅ Succès',
      detail: message,
      life: 4000,
      icon: 'pi pi-check-circle',
      styleClass: 'success-toast',
    });
  }

  // Gestion des avertissements
  private handleWarning(message: string): void {
    this.messageService.add({
      severity: 'warn',
      summary: '⚠️ Attention',
      detail: message,
      life: 5000,
      icon: 'pi pi-exclamation-triangle',
      styleClass: 'warning-toast',
    });
  }

  // Gestion des informations
  private handleInfo(message: string): void {
    this.messageService.add({
      severity: 'info',
      summary: 'ℹ️ Information',
      detail: message,
      life: 4000,
      icon: 'pi pi-info-circle',
      styleClass: 'info-toast',
    });
  }

  // Méthodes pour la gestion des plateformes
  isPlatformSelected(platform: string): boolean {
    const platforms = this.editForm.get('platforms')?.value || [];
    return Array.isArray(platforms) && platforms.includes(platform);
  }

  togglePlatform(platform: string): void {
    const platformsControl = this.editForm.get('platforms');
    if (platformsControl) {
      const currentPlatforms = platformsControl.value || [];
      let newPlatforms: string[];

      if (Array.isArray(currentPlatforms)) {
        if (currentPlatforms.includes(platform)) {
          // Retirer la plateforme
          newPlatforms = currentPlatforms.filter((p) => p !== platform);
        } else {
          // Ajouter la plateforme
          newPlatforms = [...currentPlatforms, platform];
        }
      } else {
        // Si ce n'est pas un tableau, créer un nouveau tableau
        newPlatforms = [platform];
      }

      platformsControl.setValue(newPlatforms);
    }
  }

  // Méthodes pour la gestion des groupes
  isGroupSelected(groupValue: string): boolean {
    const groups = this.editForm.get('preferredGroups')?.value || [];
    return Array.isArray(groups) && groups.includes(groupValue);
  }

  toggleGroup(groupValue: string): void {
    const groupsControl = this.editForm.get('preferredGroups');
    if (groupsControl) {
      const currentGroups = groupsControl.value || [];
      let newGroups: string[];

      if (Array.isArray(currentGroups)) {
        if (currentGroups.includes(groupValue)) {
          // Retirer le groupe
          newGroups = currentGroups.filter((g) => g !== groupValue);
        } else {
          // Ajouter le groupe
          newGroups = [...currentGroups, groupValue];
        }
      } else {
        // Si ce n'est pas un tableau, créer un nouveau tableau
        newGroups = [groupValue];
      }

      groupsControl.setValue(newGroups);
    }
  }

  // Méthodes pour la gestion des mots de passe
  togglePasswordVisibility(fieldName: string): void {
    const input = document.querySelector(
      `input[formControlName="${fieldName}"]`
    ) as HTMLInputElement;
    if (input) {
      input.type = input.type === 'password' ? 'text' : 'password';
    }
  }

  passwordsMatch(): boolean {
    const newPassword = this.passwordForm.get('newPassword')?.value;
    const confirmPassword = this.passwordForm.get('confirmPassword')?.value;
    return newPassword === confirmPassword && newPassword !== '';
  }

  canSubmitPasswordForm(): boolean {
    return this.passwordForm.valid && this.passwordsMatch();
  }

  getPasswordStrengthClass(index: number): string {
    const password = this.passwordForm.get('newPassword')?.value || '';
    const strength = this.calculatePasswordStrength(password);

    if (index < strength) {
      if (strength <= 1) return 'bg-red-500';
      if (strength <= 2) return 'bg-yellow-500';
      if (strength <= 3) return 'bg-blue-500';
      return 'bg-green-500';
    }
    return 'bg-gray-200';
  }

  getPasswordStrengthText(): string {
    const password = this.passwordForm.get('newPassword')?.value || '';
    const strength = this.calculatePasswordStrength(password);

    switch (strength) {
      case 0:
        return 'Très faible';
      case 1:
        return 'Faible';
      case 2:
        return 'Moyen';
      case 3:
        return 'Bon';
      case 4:
        return 'Très bon';
      default:
        return 'Très faible';
    }
  }

  private calculatePasswordStrength(password: string): number {
    if (!password) return 0;

    let score = 0;

    // Longueur minimale
    if (password.length >= 8) score++;

    // Contient des lettres minuscules
    if (/[a-z]/.test(password)) score++;

    // Contient des lettres majuscules
    if (/[A-Z]/.test(password)) score++;

    // Contient des chiffres
    if (/\d/.test(password)) score++;

    // Contient des caractères spéciaux
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    return Math.min(score, 4);
  }

  // Section préférences supprimée - plus nécessaire

  // Configuration des raccourcis clavier
  private setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (event: KeyboardEvent) => {
      // Ctrl/Cmd + E : Ouvrir la modification du profil
      if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
        event.preventDefault();
        this.openEditDialog();
        // Notification de raccourci supprimée
      }

      // Ctrl/Cmd + N : Ajouter un enfant
      if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault();
        this.addChildDialog = true;
        // Notification de raccourci supprimée
      }

      // Échap : Fermer tous les dialogues
      if (event.key === 'Escape') {
        this.closeAllDialogs();
      }
    });
  }

  // Fermer tous les dialogues
  private closeAllDialogs(): void {
    this.editInfosDialog = false;
    this.addChildDialog = false;
    this.editChildDialog = false;
    this.passwordDialog = false;
    this.childDetailsDialog = false;
  }

  // Gestion du mode focus
  toggleFocusMode(): void {
    if (this.isFocusMode()) {
      this.stopFocusMode();
    } else {
      this.startFocusMode();
    }
  }

  private startFocusMode(): void {
    this.isFocusMode.set(true);
    this.focusTimer.set(0);

    // Démarrer le minuteur
    this.focusInterval = setInterval(() => {
      this.focusTimer.update((timer) => timer + 1);
    }, 1000);

    // Appliquer les styles de focus
    document.body.classList.add('focus-mode');

    // Notification de focus supprimée

    // Notification de fin de session après 25 minutes (technique Pomodoro)
    setTimeout(() => {
      if (this.isFocusMode()) {
        this.showSpecialNotification({
          type: 'focus-break',
          title: '⏰ Pause recommandée',
          message:
            'Vous avez travaillé 25 minutes. Prenez une pause de 5 minutes !',
          priority: 'high',
          icon: 'pi pi-clock',
          action: 'Pause',
        });
      }
    }, 1500000); // 25 minutes
  }

  private stopFocusMode(): void {
    this.isFocusMode.set(false);

    if (this.focusInterval) {
      clearInterval(this.focusInterval);
      this.focusInterval = null;
    }

    // Retirer les styles de focus
    document.body.classList.remove('focus-mode');

    const minutes = Math.floor(this.focusTimer() / 60);
    const seconds = this.focusTimer() % 60;

    // Notification de fin de session supprimée

    // Réinitialiser le timer
    this.focusTimer.set(0);
  }

  // Calculer le progrès du formulaire
  getFormProgress(): number {
    let progress = 0;
    if (this.fullName) progress += 20;
    if (this.email) progress += 20;
    if (this.phoneNumber) progress += 20;
    if (this.address) progress += 20;
    if (this.dateOfBirth) progress += 20;
    return progress;
  }

  // Système d'animations et confettis
  private triggerConfetti(): void {
    // Créer des confettis
    for (let i = 0; i < 50; i++) {
      this.createConfetti();
    }

    // Animation de célébration
    this.triggerCelebrationAnimation();
  }

  private createConfetti(): void {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';

    // Couleurs aléatoires
    const colors = [
      '#ff6b6b',
      '#4ecdc4',
      '#45b7d1',
      '#96ceb4',
      '#feca57',
      '#ff9ff3',
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    confetti.style.cssText = `
      position: fixed;
      top: -10px;
      left: ${Math.random() * 100}vw;
      width: 10px;
      height: 10px;
      background: ${randomColor};
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      animation: confetti-fall 3s linear forwards;
    `;

    document.body.appendChild(confetti);

    // Supprimer après l'animation
    setTimeout(() => {
      if (confetti.parentNode) {
        confetti.parentNode.removeChild(confetti);
      }
    }, 3000);
  }

  private triggerCelebrationAnimation(): void {
    // Animation sur les cartes
    const cards = document.querySelectorAll('p-card');
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add('celebrate');
        setTimeout(() => card.classList.remove('celebrate'), 1000);
      }, index * 100);
    });
  }

  // Déclencher les confettis pour les accomplissements
  private checkAndCelebrateAccomplishments(): void {
    // Vérifier si c'est le premier badge débloqué
    if (
      this.achievements.length === 1 &&
      this.achievements[0].id === 'profile-complete'
    ) {
      setTimeout(() => {
        this.triggerConfetti();
        this.handleSuccess(
          '🎉 Félicitations ! Vous avez débloqué votre premier badge !'
        );
      }, 1000);
    }

    // Vérifier si la progression atteint 50%
    if (this.overallProgress >= 50 && this.overallProgress < 51) {
      setTimeout(() => {
        this.triggerConfetti();
        // Notification de progression supprimée
      }, 1000);
    }

    // Vérifier si c'est le premier enfant ajouté
    if (this.children.length === 1) {
      setTimeout(() => {
        this.triggerConfetti();
        // Notification d'enfant supprimée
      }, 1000);
    }
  }

  // Métriques analytiques avancées (valeurs statiques pour éviter les boucles infinies)
  private _weeklyProgress: number = 0;
  private _monthlyTrend: 'up' | 'down' | 'stable' = 'stable';
  private _learningStreak: number = 0;
  private _averageSessionTime: number = 0;

  get weeklyProgress(): number {
    return this._weeklyProgress;
  }

  get monthlyTrend(): 'up' | 'down' | 'stable' {
    return this._monthlyTrend;
  }

  get learningStreak(): number {
    return this._learningStreak;
  }

  get averageSessionTime(): number {
    return this._averageSessionTime;
  }

  get nextMilestone(): { target: number; current: number; remaining: number } {
    const milestones = [25, 50, 75, 100];
    const current = this.overallProgress;

    for (const milestone of milestones) {
      if (current < milestone) {
        return {
          target: milestone,
          current: current,
          remaining: milestone - current,
        };
      }
    }

    return { target: 100, current: 100, remaining: 0 };
  }

  get performanceRating():
    | 'excellent'
    | 'good'
    | 'average'
    | 'needs-improvement' {
    const score = this.accountHealthScore;
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'average';
    return 'needs-improvement';
  }

  get estimatedCompletionDate(): Date {
    // Estimer la date de completion basée sur la progression actuelle
    const current = this.overallProgress;
    const remaining = 100 - current;
    const estimatedWeeks = Math.ceil(remaining / 10); // 10% par semaine

    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + estimatedWeeks * 7);

    return completionDate;
  }

  // Méthodes utilitaires pour le template
  get daysUntilCompletion(): number {
    const now = new Date();
    const completion = this.estimatedCompletionDate;
    const diffTime = completion.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  // Initialiser les données analytiques une seule fois
  private initAnalyticsData(): void {
    // Progression hebdomadaire basée sur la progression globale
    const baseProgress = this.overallProgress;
    const weeklyVariation = Math.random() * 10 - 5; // ±5%
    this._weeklyProgress = Math.max(
      0,
      Math.min(100, baseProgress + weeklyVariation)
    );

    // Tendance mensuelle
    const current = this.overallProgress;
    const previous = current - (Math.random() * 15 - 7.5); // ±7.5%

    if (current > previous + 2) this._monthlyTrend = 'up';
    else if (current < previous - 2) this._monthlyTrend = 'down';
    else this._monthlyTrend = 'stable';

    // Série d'apprentissage
    this._learningStreak = Math.floor(Math.random() * 14) + 1; // 1-14 jours

    // Temps moyen par session
    this._averageSessionTime = Math.floor(Math.random() * 45) + 15; // 15-60 minutes
  }

  get progressDifference(): number {
    return Math.abs(this.weeklyProgress - this.overallProgress);
  }

  get isWeeklyProgressUp(): boolean {
    return this.weeklyProgress > this.overallProgress;
  }

  get milestoneProgressPercentage(): number {
    return (this.nextMilestone.current / this.nextMilestone.target) * 100;
  }

  // Gestion du thème
  toggleTheme(): void {
    this.isDarkMode.update((mode) => !mode);
    this.currentTheme.update((theme) => (theme === 'light' ? 'dark' : 'light'));

    // Appliquer le thème au document
    if (this.isDarkMode()) {
      document.documentElement.classList.add('dark');
      // Notification de thème sombre supprimée
    } else {
      document.documentElement.classList.remove('dark');
      // Notification de thème clair supprimée
    }

    // Sauvegarder la préférence
    localStorage.setItem('theme', this.currentTheme());

    // Mettre à jour les graphiques avec le nouveau thème
  }

  // Initialiser le thème
  private initTheme(): void {
    const savedTheme =
      (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
    this.currentTheme.set(savedTheme);
    this.isDarkMode.set(savedTheme === 'dark');

    if (this.isDarkMode()) {
      document.documentElement.classList.add('dark');
    }
  }

  // Système de notifications push supprimé
  private setupPushNotifications(): void {
    // Notifications automatiques désactivées
  }

  // Notifications d'événements spéciaux supprimées
  private setupEventNotifications(): void {
    // Notifications automatiques désactivées
  }

  // Interface pour les notifications spéciales supprimée
  private showSpecialNotification(notification: {
    type: string;
    title: string;
    message: string;
    priority: 'low' | 'medium' | 'high';
    icon: string;
    action: string;
  }): void {
    // Notifications spéciales désactivées
  }

  private showRandomNotification(): void {
    const notifications = [
      {
        title: '🎯 Objectif du jour',
        message: "Essayez de compléter au moins une leçon aujourd'hui !",
        type: 'info',
      },
      {
        title: '🏆 Progression',
        message:
          'Vous êtes à ' + this.overallProgress + '% de votre objectif !',
        type: 'success',
      },
      {
        title: '📚 Nouveau contenu',
        message: 'De nouvelles leçons sont disponibles !',
        type: 'info',
      },
      {
        title: '👶 Enfants',
        message: "N'oubliez pas de vérifier la progression de vos enfants",
        type: 'warn',
      },
    ];

    const randomNotif =
      notifications[Math.floor(Math.random() * notifications.length)];

    // Afficher la notification
    switch (randomNotif.type) {
      case 'success':
        // Notification aléatoire supprimée
        break;
      case 'warn':
        // Notification aléatoire supprimée
        break;
      default:
        // Notification aléatoire supprimée
        break;
    }
  }

  get profilComplet(): boolean {
    const u = this.auth.user();
    const p = u?.parentProfile;
    return !!(
      u?.firstName &&
      u?.lastName &&
      u?.phoneNumber &&
      p?.platforms?.length &&
      p?.preferredGroups?.length
    );
  }

  loadLevels() {
    this.isLoading = true;
    this.auth.getLevels().subscribe({
      next: (res) => {
        this.levels = res;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
      },
    });
  }

  // ✅ Nouvelle méthode pour charger les classes
  loadClasses() {
    this.isLoading = true;
    this.classeService.findAll().subscribe({
      next: (res) => {
        this.classes = res.filter(c => c.isActive);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Erreur chargement classes:', err);
        this.handleError(err, 'le chargement des classes');
        this.isLoading = false;
      },
    });
  }

  openEditDialog() {
    const user = this.auth.user();
    this.editForm.patchValue({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phoneNumber: user?.phoneNumber || '',
      secondaryPhone: user?.parentProfile?.secondaryPhone || '',
      platforms: user?.parentProfile?.platforms || [],
      preferredGroups: user?.parentProfile?.preferredGroups || [],
      emailOnly: user?.parentProfile?.emailOnly || '',
    });
    this.editInfosDialog = true;
  }

  validChildDate(): ValidatorFn {
    return (control: AbstractControl) => {
      const value = control.value;
      if (!value) return null;

      const birthDate = new Date(value);
      const today = new Date();

      if (birthDate > today) {
        return { futureDate: true };
      }

      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(today.getFullYear() - 2);

      if (birthDate > twoYearsAgo) {
        return { tooYoung: true };
      }

      return null;
    };
  }

  saveEdit() {
    if (this.editForm.invalid) return;

    const fv = this.editForm.value;
    const payload = {
      ...fv,
      parentProfile: {
        secondaryPhone: fv.secondaryPhone,
        platforms: fv.platforms,
        preferredGroups: fv.preferredGroups,
        emailOnly: fv.emailOnly,
      },
    };

    this.auth.updateParentProfile(this.auth.id()!, payload).subscribe({
      next: () => {
        const updated = {
          ...this.auth.user()!,
          ...fv,
        };
        this.auth.fetchAndMergeParentProfile().subscribe(() => {
          this.editInfosDialog = false;
        });
      },
      error: (err) => {
        console.error('Erreur update user', err);
      },
    });
  }

  // openAddChild() {
  //   this.childForm.reset();
  //   this.addChildDialog = true;
  // }
  openAddChild() {
    if (!this.profilComplet) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Profil requis',
        detail: 'Vous devez compléter votre profil avant d’ajouter un enfant.',
      });
      this.editInfosDialog = true;
      return;
    }
    this.addChildForm.reset();
    this.addChildDialog = true;
  }

  openPaymentPopup() {
    if (!this.profilComplet) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Profil requis',
        detail: 'Complétez votre profil avant d’accéder au paiement.',
      });
      this.editInfosDialog = true;
      return;
    }
    this.popupVisible = true;
  }

  addChild() {
    if (this.addChildForm.invalid) {
      return;
    }

    const fv = this.addChildForm.value;

    const payload: CreateChildPayload = {
      parentId: this.auth.id()!,
      firstName: fv.firstName || '',
      lastName: fv.lastName || '',
      dateOfBirth: fv.dateOfBirth || '',
      classeId: fv.classeId || 1, // ✅ Changé de levelId à classeId
      childProfile: {
        gender: fv.gender || 'masculin',
        isAvailableWednesdayMorning: fv.isAvailableWednesdayMorning || false,
        hasExtracurricularActivity: fv.hasExtracurricularActivity || false,
        extracurricularDetails: fv.extracurricularDetails || '',
        preferredTimeSlots: fv.preferredTimeSlots || [],
        priorArabicExperience: fv.priorArabicExperience || '',
        hasLearningDisability: fv.hasLearningDisability || false,
      },
    };


    this.auth.addChild(payload).subscribe({
      next: () => {
        // Fermer le modal d'ajout d'enfant
        this.showAddChildModal = false;
        // Réinitialiser le formulaire
        this.addChildForm.reset();
        // Recharger la liste des enfants
        this.loadChildren();
        // Notification de succès
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Enfant ajouté avec succès !',
        });
      },
      error: (err) => {
        console.error('Erreur ajout enfant', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: `Erreur lors de l'ajout: ${
            err.error?.message || err.message || 'Erreur inconnue'
          }`,
        });
      },
    });
  }

  loadChildren() {
    this.isLoading = true;
    this.auth.getChildren(this.auth.id()!).subscribe({
      next: (res) => {
        this.children = res;
        this.childContext.loadChildren();
        this.isLoading = false;
      },
      error: (err) => {
        this.handleError(err, 'le chargement des enfants');
        this.isLoading = false;
      },
    });
  }

  confirmDeleteChild(child: any) {
    this.confirmationService.confirm({
      header: 'Supprimer cet enfant ?',
      message:
        'Cette action est définitive. Êtes-vous sûr de vouloir supprimer cet enfant ?',
      acceptLabel: 'Oui, supprimer',
      rejectLabel: 'Annuler',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass:
        'bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md',
      rejectButtonStyleClass:
        'bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-md',
      accept: () => {
        this.auth.deleteChild(child.id).subscribe({
          next: () => {
            // Désélectionner l'enfant supprimé s'il était sélectionné
            if (this.childContext.selectedChild()?.id === child.id) {
              // Nettoyer la sélection d'enfant
              localStorage.removeItem('selectedChild');
              // Recharger le contexte pour mettre à jour la sélection
              this.childContext.loadChildren();
            }
            this.loadChildren();
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Enfant supprimé avec succès !',
            });
          },
          error: (err) => {
            console.error('Erreur suppression enfant', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: "Impossible de supprimer l'enfant. Veuillez réessayer.",
            });
          },
        });
      },
    });
  }

  confirmDeleteAccount() {
    this.confirmationService.confirm({
      header: 'Supprimer le compte',
      message:
        'Cette action est définitive. Êtes-vous sûr de vouloir votre compte ?',
      acceptLabel: 'Oui, supprimer',
      rejectLabel: 'Annuler',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass:
        'bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md',
      rejectButtonStyleClass:
        'bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-md',
      accept: () => {
        this.auth.deleteMyAccount(this.auth.id()!).subscribe({
          next: () => {
            this.auth.logout();
            this.router.navigate(['/']);
          },
          error: (err) => {
            if (
              err?.error?.message?.includes(
                'Impossible de supprimer un parent avec des enfants'
              )
            ) {
              this.messageService.add({
                severity: 'warn',
                summary: 'Suppression impossible',
                detail:
                  'Vous devez d’abord supprimer vos enfants avant de supprimer votre compte.',
              });
            } else {
              console.error('Erreur suppression compte', err);
            }
          },
        });
      },
    });
  }

  openPasswordDialog() {
    this.passwordForm.reset();
    this.passwordDialog = true;
  }

  submitPasswordChange() {
    if (this.passwordForm.invalid) return;

    const { currentPassword, newPassword, confirmPassword } =
      this.passwordForm.value;

    if (newPassword !== confirmPassword) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Erreur',
        detail: 'Les mots de passe ne correspondent pas',
      });
      return;
    }

    this.auth.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.passwordDialog = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Mot de passe mis à jour avec succès !',
        });
      },
      error: (err) => {
        console.error('Erreur mot de passe', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: err?.error?.message || 'Échec du changement de mot de passe',
        });
      },
    });
  }

  viewChild(child: any) {
    this.selectedChild = child;
    this.childDetailsDialog = true;
  }

  openChildDetails(child: any) {
    this.selectedChild = child;
    this.childDetailsDialog = true;
  }
  popupVisible = false;

  // openPaymentPopup() {
  //   this.popupVisible = true;
  // }

  get isAdmin(): boolean {
    return this.auth.role() === 'admin';
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  // Méthodes pour le template
  onChildChange() {
    console.log('Enfant sélectionné:', this.selectedChildId);
    // Logique pour changer d'enfant
  }

  toggleDarkMode() {
    this.isDarkMode.set(!this.isDarkMode());
    // Logique pour changer le thème
  }

  getAccountHealthColor(): string {
    const level = this.accountHealthLevel;
    switch (level) {
      case 'excellent':
        return 'text-emerald-600';
      case 'bon':
        return 'text-blue-600';
      case 'moyen':
        return 'text-yellow-600';
      case 'faible':
        return 'text-orange-600';
      case 'critique':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }

  getAccountHealthBarColor(): string {
    const level = this.accountHealthLevel;
    switch (level) {
      case 'excellent':
        return 'bg-emerald-500';
      case 'bon':
        return 'bg-blue-500';
      case 'moyen':
        return 'bg-yellow-500';
      case 'faible':
        return 'bg-orange-500';
      case 'critique':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  }

  getBadgeColor(color: string): string {
    const colorMap: { [key: string]: string } = {
      emerald: 'bg-emerald-500',
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
      red: 'bg-red-500',
      yellow: 'bg-yellow-500',
    };
    return colorMap[color] || 'bg-gray-500';
  }

  // Navigation entre sections
  activeSection: any = 'overview';

  dashboardSections = [
    {
      id: 'overview',
      label: "Vue d'ensemble",
      icon: 'fa-solid fa-home',
      badge: null,
    },
    {
      id: 'children',
      label: 'Mes Enfants',
      icon: 'fa-solid fa-child',
      badge: null,
    },
    {
      id: 'assignments',
      label: 'Devoirs',
      icon: 'fa-solid fa-clipboard-list',
      badge: null,
    },
    {
      id: 'courses',
      label: 'Mes Cours',
      icon: 'fa-solid fa-book',
      badge: null,
    },
    {
      id: 'zoom',
      label: 'Cours en ligne',
      icon: 'fas fa-video',
      badge: null,
    },
    {
      id: 'payment',
      label: 'Paiement',
      icon: 'fa-solid fa-credit-card',
      badge: null,
    },
    {
      id: 'stats',
      label: 'Statistiques',
      icon: 'fa-solid fa-chart-bar',
      badge: null,
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: 'fa-solid fa-cog',
      badge: null,
    },
  ];

  // Données pour les sections
  userCourses = [
    {
      title: 'Arabe Débutant',
      subject: 'Arabe',
      progress: 75,
      lessonsCompleted: 6,
      totalLessons: 8,
      quizzesCompleted: 4,
    },
    {
      title: 'Mathématiques CP',
      subject: 'Mathématiques',
      progress: 45,
      lessonsCompleted: 3,
      totalLessons: 7,
      quizzesCompleted: 2,
    },
  ];

  recentActivity = [
    {
      type: 'course',
      description: "Terminé la leçon 3 d'Arabe Débutant",
      time: new Date(),
    },
    {
      type: 'quiz',
      description: 'Quiz de Mathématiques réussi (85%)',
      time: new Date(Date.now() - 3600000),
    },
    {
      type: 'login',
      description: 'Connexion à la plateforme',
      time: new Date(Date.now() - 7200000),
    },
  ];

  // Méthodes pour la navigation
  setActiveSection(sectionId: any) {
    this.activeSection = sectionId;
    
    // Mettre à jour l'URL pour refléter la section active
    this.updateUrlForSection(sectionId);
    
    // Charger les devoirs quand on accède à la section assignments
    if (sectionId === 'assignments' && this.assignments.length === 0) {
      this.fetchAssignments();
    }
  }

  // Mettre à jour l'URL selon la section active
  private updateUrlForSection(sectionId: string) {
    if (sectionId === 'zoom') {
      // Garder le paramètre section=zoom pour la section Zoom
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { section: 'zoom' },
        replaceUrl: true
      });
    } else {
      // Supprimer le paramètre section pour les autres sections
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {},
        replaceUrl: true
      });
    }
  }

  // Méthode pour récupérer les devoirs
  fetchAssignments(): void {
    this.assignmentsLoading = true;
    this.assignmentsError = null;

    // Debug: Vérifier les informations de l'utilisateur
   

    this.assignmentService.getParentAssignments().subscribe({
      next: (response: ParentAssignmentsResponse) => {
        if (response.success && response.data) {
          // Convertir l'objet en tableau
          this.assignments = Object.values(response.data);
          
          // Trier par nombre de devoirs urgents
          this.assignments.sort((a, b) => {
            const urgentA = a.assignments.filter((assignment: Assignment) => 
              this.assignmentService.isUrgent(assignment)
            ).length;
            const urgentB = b.assignments.filter((assignment: Assignment) => 
              this.assignmentService.isUrgent(assignment)
            ).length;
            return urgentB - urgentA;
          });
        } else {
          this.assignmentsError = response.message || 'Erreur lors de la récupération des devoirs';
        }
        this.assignmentsLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des devoirs:', error);
        this.assignmentsError = 'Erreur lors de la récupération des devoirs';
        this.assignmentsLoading = false;
      }
    });
  }

  // Méthodes utilitaires pour les devoirs
  getTotalAssignments(): number {
    return this.assignments.reduce((total, classe) => total + classe.assignments.length, 0);
  }

  getUrgentAssignments(): number {
    return this.assignments.reduce((total, classe) => {
      return total + classe.assignments.filter((assignment: Assignment) => 
        this.assignmentService.isUrgent(assignment)
      ).length;
    }, 0);
  }

  getOverdueAssignments(): number {
    return this.assignments.reduce((total, classe) => {
      return total + classe.assignments.filter((assignment: Assignment) => 
        assignment.status === 'overdue'
      ).length;
    }, 0);
  }

  getDueSoonAssignments(): number {
    return this.assignments.reduce((total, classe) => {
      return total + classe.assignments.filter((assignment: Assignment) => 
        assignment.status === 'due_soon'
      ).length;
    }, 0);
  }

  formatDate(dateString: string | null): string {
    return this.assignmentService.formatDate(dateString);
  }

  getStatusLabel(status: string): string {
    return this.assignmentService.getStatusLabel(status);
  }

  getStatusClass(status: string): string {
    return this.assignmentService.getStatusClass(status);
  }

  isUrgent(assignment: Assignment): boolean {
    return this.assignmentService.isUrgent(assignment);
  }

  getUrgentAssignmentsForClasse(classeData: any): Assignment[] {
    return classeData.assignments.filter((assignment: Assignment) => 
      this.assignmentService.isUrgent(assignment)
    );
  }

  // Méthodes pour bloquer les boutons
  onDisabledButtonClick(type: 'courses') {
    let message = '';
    switch (type) {
      case 'courses':
        message = 'Les cours seront bientôt disponibles !';
        break;
    }
    alert(message);
  }

  // Méthode appelée quand un paiement SumUp est réussi
  onPaymentSuccess() {
    // Notification de succès
    this.messageService.add({
      severity: 'success',
      summary: 'Paiement validé ✅',
      detail: 'Votre paiement SumUp a été enregistré avec succès.',
      life: 5000
    });
    
    // Recharger les données utilisateur pour refléter le nouveau paiement
    this.auth.fetchAndMergeParentProfile().subscribe();
    
    // Fermer le popup de paiement si ouvert
    this.popupVisible = false;
    
    // Déclencher l'animation de célébration
    setTimeout(() => {
      this.triggerConfetti();
    }, 500);
  }

  // Méthode pour créer un paiement SumUp
  payWithSumUp(amount: number) {
    if (!this.profilComplet) {
      this.handleWarning('Vous devez compléter votre profil avant d\'effectuer un paiement.');
      this.editInfosDialog = true;
      return;
    }

    const userId = this.auth.id();
    if (!userId) {
      this.handleError('error', 'Utilisateur non identifié');
      return;
    }

    // Créer le checkout SumUp via le service de paiement
    // Note: Vous devrez adapter selon votre service de paiement
    this.handleInfo('Redirection vers SumUp en cours...');
    
    // Exemple d'URL de redirection vers SumUp
    const sumupUrl = `/api/payment/sumup-checkout?amount=${amount}&userId=${userId}`;
    window.open(sumupUrl, '_blank');
  }

  getActivityColor(type: string): string {
    const colorMap: { [key: string]: string } = {
      course: 'bg-blue-500',
      quiz: 'bg-green-500',
      login: 'bg-purple-500',
    };
    return colorMap[type] || 'bg-gray-500';
  }

  getActivityIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      course: 'fa-solid fa-book',
      quiz: 'fa-solid fa-question-circle',
      login: 'fa-solid fa-sign-in-alt',
    };
    return iconMap[type] || 'fa-solid fa-circle';
  }

  // Gestion des modales
  showAddChildModal = false;
  showChildDetailsModal = false;
  showFocusModal = false;
  showDeleteConfirmModal = false;
  childToDelete: any = null;
  showEditChildModal = false;
  showEditDialog = false;

  // Gestion des notifications
  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' | 'info' = 'info';

  // Formulaire d'ajout d'enfant
  addChildForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    dateOfBirth: ['', [Validators.required, this.validChildDate()]],
    classeId: [null, Validators.required], // ✅ Changé de levelId à classeId
    gender: [null, Validators.required],
    isAvailableWednesdayMorning: [false],
    hasExtracurricularActivity: [false],
    extracurricularDetails: [''],
    preferredTimeSlots: [[]],
    priorArabicExperience: [''],
    hasLearningDisability: [false],
  });

  // Méthodes pour les modales
  openAddChildModal() {
    this.showAddChildModal = true;
    this.addChildForm.reset();
  }

  closeAddChildModal() {
    this.showAddChildModal = false;
  }

  openChildDetailsModal(child: any) {
    this.selectedChild = child;
    this.showChildDetailsModal = true;
  }

  closeChildDetailsModal() {
    this.showChildDetailsModal = false;
    this.selectedChild = null;
  }

  openFocusModal() {
    this.showFocusModal = true;
  }

  closeFocusModal() {
    this.showFocusModal = false;
  }

  // Méthodes pour les formulaires

  editChild(child: any) {
    this.selectedChild = child;

    // Récupérer les informations essentielles de l'enfant
    const childData = {
      firstName: child.firstName || '',
      lastName: child.lastName || '',
      dateOfBirth: child.dateOfBirth || child.birthDate || '',
      classeId: child.classe?.id || child.classeId || '', // ✅ Changé de levelId à classeId
    };

  

    this.editChildForm.patchValue(childData);
    this.showEditChildModal = true;
  }

  openEditChildModal() {
    this.showEditChildModal = true;
  }

  closeEditChildModal() {
    this.showEditChildModal = false;
    this.selectedChild = null;
  }

  submitEditChild() {
    if (this.editChildForm.valid && this.selectedChild) {
      this.isSubmitting = true;

      const formValue = this.editChildForm.value;

      // Préparer les données pour l'API
      const updateData = {
        id: this.selectedChild.id,
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        dateOfBirth: formValue.dateOfBirth,
        classeId: formValue.classeId,
      };


      // Appel à l'API pour mettre à jour l'enfant
      this.http
        .patch(`${ApiPaths.users}/children/${updateData.id}`, updateData)
        .subscribe({
          next: (response: any) => {
            this.updateLocalChildData(response);
            this.isSubmitting = false;
            this.closeEditChildModal();
            this.showNotificationMessage(
              'Enfant modifié avec succès !',
              'success'
            );
          },
          error: (error: any) => {
            console.error('Erreur lors de la modification:', error);
            this.isSubmitting = false;
            this.showNotificationMessage(
              'Erreur lors de la modification',
              'error'
            );
          },
        });
    }
  }

  private updateLocalChildData(updateData: any) {
    // Mettre à jour l'enfant sélectionné
    this.selectedChild.firstName = updateData.firstName;
    this.selectedChild.lastName = updateData.lastName;
    this.selectedChild.dateOfBirth = updateData.dateOfBirth;
    this.selectedChild.classeId = updateData.classeId;
    
    // Trouver la classe correspondante
    const selectedClasse = this.classes.find(c => c.id === updateData.classeId);
    if (selectedClasse) {
      this.selectedChild.classe = selectedClasse;
    }

    // Mettre à jour la liste des enfants
    const index = this.children.findIndex(
      (c) => c.id === this.selectedChild.id
    );
    if (index !== -1) {
      this.children[index] = { ...this.selectedChild };
    }

    // 🔄 FORCER LA MISE À JOUR DU CONTEXTE ENFANT
    // Cela va déclencher l'effect() dans app-level-page
    this.childContext.loadChildren();

    // Si cet enfant est actuellement sélectionné, mettre à jour la sélection
    if (this.childContext.selectedChild()?.id === this.selectedChild.id) {
      this.childContext.setSelectedChild(this.selectedChild);
    }
  }

  // Méthodes pour le paiement
  openPayPalModal() {
    this.showNotificationMessage('Modal PayPal à implémenter', 'info');
  }

  openStripeModal() {
    this.showNotificationMessage('Modal Stripe à implémenter', 'info');
  }

  deleteChild(child: any) {
    this.childToDelete = child;
    this.showDeleteConfirmModal = true;
  }

  cancelDelete() {
    this.showDeleteConfirmModal = false;
    this.childToDelete = null;
  }

  confirmDelete() {
    if (this.childToDelete) {
      // Appeler l'API pour supprimer l'enfant
      this.auth.deleteChild(this.childToDelete.id).subscribe({
        next: () => {
          // Désélectionner l'enfant supprimé s'il était sélectionné
          if (this.childContext.selectedChild()?.id === this.childToDelete.id) {
            // Nettoyer la sélection d'enfant
            localStorage.removeItem('selectedChild');
            // Recharger le contexte pour mettre à jour la sélection
            this.childContext.loadChildren();
          }

          // Mettre à jour la liste locale
          this.children = this.children.filter(
            (c) => c.id !== this.childToDelete.id
          );

          // Fermer les modals
          this.showDeleteConfirmModal = false;
          this.childToDelete = null;
          this.closeChildDetailsModal();

          // Notification de succès
          this.showNotificationMessage(
            'Enfant supprimé avec succès',
            'success'
          );
        },
        error: (err) => {
          console.error('Erreur suppression enfant', err);
          this.showNotificationMessage(
            "Impossible de supprimer l'enfant. Veuillez réessayer.",
            'error'
          );
        },
      });
    }
  }

  // Méthodes pour le mode focus
  startFocusSession(minutes: number) {
    this.isFocusMode.set(true);
    this.focusTimer.set(minutes * 60);
    this.closeFocusModal();

    this.focusInterval = setInterval(() => {
      this.focusTimer.update((timer) => {
        if (timer <= 0) {
          this.stopFocusSession();
          return 0;
        }
        return timer - 1;
      });
    }, 1000);

    this.showNotificationMessage(
      `Session de focus de ${minutes} minutes démarrée !`,
      'success'
    );
  }

  stopFocusSession() {
    this.isFocusMode.set(false);
    this.focusTimer.set(0);
    if (this.focusInterval) {
      clearInterval(this.focusInterval);
      this.focusInterval = null;
    }
    this.showNotificationMessage('Session de focus terminée', 'info');
  }

  // Méthodes pour les notifications
  showNotificationMessage(
    message: string,
    type: 'success' | 'error' | 'info' = 'info'
  ) {
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;

    setTimeout(() => {
      this.hideNotification();
    }, 5000);
  }

  hideNotification() {
    this.showNotification = false;
  }

  getNotificationIcon(): string {
    const iconMap: { [key: string]: string } = {
      success: 'fa-solid fa-check-circle',
      error: 'fa-solid fa-exclamation-circle',
      info: 'fa-solid fa-info-circle',
    };
    return iconMap[this.notificationType] || 'fa-solid fa-info-circle';
  }

  /**
   * Charger les statistiques de quiz
   */
  loadQuizStats(): void {
    this.isLoadingQuizStats = true;
    
    this.courseService.getQuizProgressStats().subscribe({
      next: (response) => {
        if (response.success) {
          this.quizStats = response.data;
        }
        this.isLoadingQuizStats = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des statistiques de quiz:', error);
        this.isLoadingQuizStats = false;
      }
    });
  }

  /**
   * Gestion des retours de paiement Stripe
   */
  private handlePaymentReturn(): void {
    const paymentStatus = this.route.snapshot.queryParams['payment'];
    const sessionId = this.route.snapshot.queryParams['session_id'];

    if (paymentStatus === 'success' && sessionId) {
      this.paymentStatus = 'success';
      this.paymentSessionId = sessionId;
      
      // Confirmer le paiement avec l'API
      this.confirmStripePayment(sessionId);

    } else if (paymentStatus === 'cancel') {
      this.paymentStatus = 'cancel';
      
      // Afficher un message d'annulation
      this.messageService.add({
        severity: 'warn',
        summary: 'Paiement annulé',
        detail: 'Votre paiement a été annulé. Vous pouvez réessayer à tout moment.',
        life: 5000
      });

      // Nettoyer l'URL des paramètres de paiement
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {},
        replaceUrl: true
      });
    }
  }

  /**
   * Confirmer un paiement Stripe avec l'API
   */
  private confirmStripePayment(sessionId: string): void {
    this.http.post('https://centre-culturel-olivier.fr/api/payment/confirm-stripe', {
      session_id: sessionId
    }).subscribe({
      next: (response: any) => {
        if (response.success) {
          // Afficher un message de succès
          this.messageService.add({
            severity: 'success',
            summary: 'Paiement réussi !',
            detail: 'Votre paiement a été traité avec succès. Merci pour votre achat !',
            life: 5000
          });
        } else {
          // Afficher un message d'erreur
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur de confirmation',
            detail: 'Erreur lors de la confirmation du paiement.',
            life: 5000
          });
        }
      },
      error: (error) => {
        console.error('Erreur confirmation paiement:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur de confirmation',
          detail: 'Erreur lors de la confirmation du paiement.',
          life: 5000
        });
      },
      complete: () => {
        // Nettoyer l'URL des paramètres de paiement
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {},
          replaceUrl: true
        });
      }
    });
  }

  /**
   * Charger l'historique des paiements de l'utilisateur
   */
  loadPaymentHistory(): void {
    if (!this.id) return;

    this.isLoadingPaymentHistory = true;
    this.paymentService.getPaymentHistory(this.id).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.paymentHistory = response.data || [];
        } else {
          console.error('Erreur lors du chargement de l\'historique des paiements:', response.message);
          this.paymentHistory = [];
        }
        this.isLoadingPaymentHistory = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'historique des paiements:', error);
        this.paymentHistory = [];
        this.isLoadingPaymentHistory = false;
      }
    });
  }

  /**
   * Formater le montant pour l'affichage
   */
  formatAmount(amount: string | number): string {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return numAmount.toFixed(2) + ' €';
  }

  /**
   * Obtenir la couleur du statut de paiement
   */
  getPaymentStatusColor(status: string): string {
    switch (status) {
      case 'completed': return 'green';
      case 'pending': return 'orange';
      case 'failed': return 'red';
      case 'cancelled': return 'gray';
      default: return 'blue';
    }
  }

  /**
   * Obtenir l'icône de la méthode de paiement
   */
  getPaymentMethodIcon(method: string): string {
    switch (method) {
      case 'stripe': return 'pi pi-credit-card';
      case 'paypal': return 'pi pi-paypal';
      case 'sumup': return 'pi pi-mobile';
      default: return 'pi pi-money-bill';
    }
  }


  /**
   * Obtenir l'heure actuelle formatée
   */
  getCurrentTime(): string {
    const now = new Date();
    return now.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  /**
   * Obtenir la date actuelle formatée
   */
  getCurrentDate(): string {
    const now = new Date();
    return now.toLocaleDateString('fr-FR', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Charger les prochaines sessions depuis le planning des classes
   */
  loadUpcomingSessions(): void {
    this.isLoadingSessions = true;
    
    this.classeService.findAll().subscribe({
      next: (classes) => {
        this.upcomingSessions = this.buildUpcomingSessions(classes);
        this.isLoadingSessions = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des sessions:', error);
        this.isLoadingSessions = false;
        this.upcomingSessions = [];
      }
    });
  }

  /**
   * Construire la liste des prochaines sessions à partir des classes
   */
  private buildUpcomingSessions(classes: any[]): any[] {
    const sessions: any[] = [];
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    classes.forEach(classe => {
      if (classe.schedules && classe.schedules.length > 0) {
        classe.schedules.forEach((schedule: any) => {
          // Générer les sessions pour les 7 prochains jours
          for (let i = 0; i < 7; i++) {
            const sessionDate = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
            const dayName = this.getDayName(sessionDate.getDay());
            
            if (this.getDayName(schedule.day) === dayName) {
              sessions.push({
                id: `${classe.id}-${schedule.id}-${i}`,
                title: classe.name,
                description: schedule.description || `Cours de ${classe.name}`,
                date: this.formatSessionDate(sessionDate),
                time: schedule.startHour,
                endTime: schedule.endHour,
                day: schedule.day,
                classeId: classe.id,
                scheduleId: schedule.id,
                teacher: schedule.teacher?.firstName + ' ' + schedule.teacher?.lastName || 'Professeur',
                location: schedule.location || 'En ligne',
                online: schedule.online !== false, // Par défaut en ligne
                color: classe.color || '#3B82F6'
              });
            }
          }
        });
      }
    });

    // Trier par date et heure
    return sessions.sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      return dateA.getTime() - dateB.getTime();
    });
  }

  /**
   * Obtenir le nom du jour en français
   */
  private getDayName(dayIndex: number): string {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return days[dayIndex];
  }

  /**
   * Formater la date de session
   */
  private formatSessionDate(date: Date): string {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  }

  /**
   * Rejoindre une réunion Zoom (version simplifiée avec une seule salle)
   */
  joinZoomMeeting(session?: any): void {
    if (!this.zoomUrl) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'URL de réunion Zoom non configurée.',
        life: 5000
      });
      return;
    }

    // Ouvrir la réunion Zoom dans un nouvel onglet
    window.open(this.zoomUrl, '_blank');
    
    // Afficher une notification de succès
    const sessionInfo = session ? ` pour ${session.title}` : '';
    this.messageService.add({
      severity: 'success',
      summary: 'Ouverture Zoom',
      detail: `La réunion Zoom s'ouvre dans un nouvel onglet${sessionInfo}.`,
      life: 3000
    });
  }
}
