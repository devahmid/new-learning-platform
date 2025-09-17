import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { adminGuard, authGuard } from './auth/auth.guard';
import { LandingLayoutComponent } from './layouts/landing-layout/landing-layout.component';
import { AppLayoutComponent } from './pages/home/app-layout/app-layout.component';
import { childGuard } from './_children-context/_children-context/child.guard';
import { UserStatusGuard } from './guards/user-status.guard';
import { RegistrationComponent } from './registration/registration.component';
import { ConfirmationComponent } from './registration/confirmation/confirmation.component';

export const routes: Routes = [
  //🔓 Landing (public)
  {
    path: '',
    component: LandingLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/home/landing-page/landing-page.component').then(
            (m) => m.LandingPageComponent
          ),
      },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      {
        path: 'paiement',
        loadComponent: () =>
          import('./payment/components/payment-page.component').then(
            (m) => m.PaymentPageComponent
          ),
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./pages/forgot-password/forgot-password.component').then(
            (m) => m.ForgotPasswordComponent
          ),
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./pages/reset-password/reset-password.component').then(
            (m) => m.ResetPasswordComponent
          ),
      },
      {
        path: 'waiting-approval',
        loadComponent: () =>
          import('./pages/waiting-approval/waiting-approval.component').then(
            (m) => m.WaitingApprovalComponent
          ),
      },
      {
        path: 'account-rejected',
        loadComponent: () =>
          import('./pages/account-rejected/account-rejected.component').then(
            (m) => m.AccountRejectedComponent
          ),
      },

      {
        path: 'tarifs',
        loadComponent: () =>
          import('./pages/home/pricing/pricing.component').then(
            (m) => m.PricingComponent
          ),
      },
      {
        path: 'contact',
        loadComponent: () =>
          import('./pages/home/contact/contact.component').then(
            (m) => m.ContactComponent
          ),
      },

      // {
      //   path: 'matières',
      //   loadComponent: () =>
      //     import('./subject-grid/subject-grid.component').then(m => m.SubjectGridComponent)
      // },
      // {
      //   path: 'matières/:name',
      //   loadComponent: () =>
      //     import('./level-page/level-page.component').then(m => m.LevelPageComponent)
      // },
    ],
  },

  // 🔐 Authenticated routes
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [authGuard, UserStatusGuard],
    children: [
      {
        path: 'matières',
        loadComponent: () =>
          import('./subject-grid/subject-grid.component').then(
            (m) => m.SubjectGridComponent
          ),
        canActivate: [childGuard],
      },
      {
        path: 'no-children-info',
        loadComponent: () =>
          import('./pages/no-children-info/no-children-info.component').then(
            (m) => m.NoChildrenInfoComponent
          ),
      },
      {
        path: 'matières/:name',
        loadComponent: () =>
          import('./level-page/level-page.component').then(
            (m) => m.LevelPageComponent
          ),
        canActivate: [childGuard],
      },
      {
        path: 'calendar',
        loadComponent: () =>
          import('./calendar-classe/calendar-classe.component').then(
            (m) => m.CalendarClasseComponent
          ),
      },
      {
        path: 'cours',
        loadComponent: () =>
          import('./cours/cours-list/cours-list.component').then(
            (m) => m.CoursListComponent
          ),
        canActivate: [childGuard],
      },
      {
        path: 'cours/:subjectName/:level',
        loadComponent: () =>
          import('./cours/niveau-user/niveau-user.component').then(
            (m) => m.NiveauUserComponent
          ),
        canActivate: [childGuard],
      },
      {
        path: 'cours/:id',
        loadComponent: () =>
          import('./cours/cours-detail/cours-detail.component').then(
            (m) => m.CoursDetailComponent
          ),
        canActivate: [childGuard],
      },
      {
        path: 'cours/:subject/:level/lesson/:id',
        loadComponent: () =>
          import('./cours/lesson-detail/lesson-detail.component').then(
            (m) => m.LessonDetailComponent
          ),
        canActivate: [childGuard],
      },
      {
        path: 'exercices/:subject/:level',
        loadComponent: () =>
          import('./exercises/exercise/exercise.component').then(
            (m) => m.ExerciseComponent
          ),
        canActivate: [authGuard, childGuard],
      },
      {
        path: 'quiz/:id',
        loadComponent: () =>
          import('./quiz/quiz/quiz.component').then((m) => m.QuizComponent),
        canActivate: [childGuard],
      },
      {
        path: 'mon-compte',
        loadComponent: () =>
          import('./user/user-dashboard/user-dashboard.component').then(
            (m) => m.UserDashboardComponent
          ),
      },
      {
        path: 'progress',
        loadChildren: () =>
          import('./progress/progress.module').then((m) => m.ProgressModule),
      },
      {
        path: 'messaging',
        loadComponent: () =>
          import('./components/messaging/messaging.component').then((m) => m.MessagingComponent),
      },
    ],
  },

  // 👑 Admin routes (nested under /admin)
  {
    path: 'admin',
    component: AppLayoutComponent,
    canActivate: [authGuard],
    canActivateChild: [adminGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./admin/admin-dashboard.component').then(
            (m) => m.AdminDashboardComponent
          ),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./admin/users/users.component').then((m) => m.UsersComponent),
      },
      {
        path: 'users/children/:id/edit',
        loadComponent: () =>
          import('./admin/users/edit-child/edit-child.component').then(
            (m) => m.EditChildComponent
          ),
      },
      {
        path: 'users/parents/:id/edit',
        loadComponent: () =>
          import('./admin/users/edit-parent/edit-parent.component').then(
            (m) => m.EditParentComponent
          ),
      },
      {
        path: 'users/classes',
        loadComponent: () =>
          import('./admin/classes/classes.component').then(
            (m) => m.ClassesComponent
          ),
      },

      {
        path: 'users/list',
        loadComponent: () =>
          import('./admin/users/list/list.component').then(
            (m) => m.ListComponent
          ),
      },
      {
        path: 'users/ajout',
        loadComponent: () =>
          import('./admin/users/ajout/ajout.component').then(
            (m) => m.AjoutComponent
          ),
      },
      {
        path: 'users/:id',
        loadComponent: () =>
          import('./admin/users/details/details.component').then(
            (m) => m.DetailsComponent
          ),
      },

      {
        path: 'courses',
        loadComponent: () =>
          import('./admin/courses/courses.component').then(
            (m) => m.CoursesComponent
          ),
      },
      {
        path: 'courses/liste',
        loadComponent: () =>
          import('./admin/courses/list/list.component').then(
            (m) => m.ListComponent
          ),
      },
      {
        path: 'courses/ajout',
        loadComponent: () =>
          import('./admin/courses/ajout/ajout.component').then(
            (m) => m.AjoutComponent
          ),
      },
      {
        path: 'courses/builder',
        loadComponent: () =>
          import('./admin/course-builder/course-builder.component').then(
            (m) => m.CourseBuilderComponent
          ),
      },
      {
        path: 'courses/builder/:id',
        loadComponent: () =>
          import('./admin/course-builder/course-builder.component').then(
            (m) => m.CourseBuilderComponent
          ),
      },
      {
        path: 'courses/edit/:id',
        loadComponent: () =>
          import('./admin/courses/ajout/ajout.component').then(
            (m) => m.AjoutComponent
          ),
      },
      {
        path: 'courses/view/:id',
        loadComponent: () =>
          import('./admin/courses/view/view.component').then(
            (m) => m.ViewComponent
          ),
      },
      {
        path: 'courses/lessons',
        loadComponent: () =>
          import('./admin/courses/lessons/lessons.component').then(
            (m) => m.LessonsComponent
          ),
      },
      {
        path: 'courses/categories',
        loadComponent: () =>
          import('./admin/courses/categories/categories.component').then(
            (m) => m.CategoriesComponent
          ),
      },
      {
        path: 'courses/subcategories',
        loadComponent: () =>
          import('./admin/courses/subcategories/subcategories.component').then(
            (m) => m.SubcategoriesComponent
          ),
      },
      {
        path: 'courses/niveaux',
        loadComponent: () =>
          import('./admin/courses/niveaux/niveaux.component').then(
            (m) => m.NiveauxComponent
          ),
      },
      {
        path: 'courses/quiz',
        loadComponent: () =>
          import('./admin/courses/quiz/quiz.component').then(
            (m) => m.QuizComponent
          ),
      },
      {
        path: 'courses/questions',
        loadComponent: () =>
          import('./admin/courses/questions/questions.component').then(
            (m) => m.QuestionsComponent
          ),
      },
      {
        path: 'courses/answers',
        loadComponent: () =>
          import('./admin/courses/answers/answers.component').then(
            (m) => m.AnswersComponent
          ),
      },
      {
        path: 'courses/results',
        loadComponent: () =>
          import('./admin/courses/results/results.component').then(
            (m) => m.ResultsComponent
          ),
      },
      {
        path: 'courses/inscriptions',
        loadComponent: () =>
          import('./admin/courses/inscriptions/inscriptions.component').then(
            (m) => m.InscriptionsComponent
          ),
      },
      {
        path: 'courses/populaires',
        loadComponent: () =>
          import('./admin/courses/populaires/populaires.component').then(
            (m) => m.PopulairesComponent
          ),
      },
      {
        path: 'courses/termines',
        loadComponent: () =>
          import('./admin/courses/termines/termines.component').then(
            (m) => m.TerminesComponent
          ),
      },

      // 🎯 Exercises management
      {
        path: 'exercises',
        loadComponent: () =>
          import('./admin/exercises/list/list.component').then(
            (m) => m.ExerciseListComponent
          ),
      },
      {
        path: 'exercises/create',
        loadComponent: () =>
          import('./admin/exercises/form/form.component').then(
            (m) => m.ExerciseFormComponent
          ),
      },
      {
        path: 'exercises/edit/:id',
        loadComponent: () =>
          import('./admin/exercises/form/form.component').then(
            (m) => m.ExerciseFormComponent
          ),
      },

      {
        path: 'stats',
        loadComponent: () =>
          import('./admin/stats/stats.component').then((m) => m.StatsComponent),
      },
      {
        path: 'add-course',
        loadComponent: () =>
          import('./admin/cours-ajout/cours-ajout.component').then(
            (m) => m.CoursAjoutComponent
          ),
      },

      // 🛠 Settings group
      {
        path: 'settings',
        loadComponent: () =>
          import('./admin/settings/settings.component').then(
            (m) => m.SettingsComponent
          ),
      },
      {
        path: 'settings/profile',
        loadComponent: () =>
          import('./admin/settings/profile/profile.component').then(
            (m) => m.ProfileComponent
          ),
      },
      {
        path: 'settings/theme',
        loadComponent: () =>
          import('./admin/settings/theme/theme.component').then(
            (m) => m.ThemeComponent
          ),
      },
      {
        path: 'settings/notifications',
        loadComponent: () =>
          import('./admin/settings/notifications/notifications.component').then(
            (m) => m.NotificationsComponent
          ),
      },
      {
        path: 'settings/security',
        loadComponent: () =>
          import('./admin/settings/security/security.component').then(
            (m) => m.SecurityComponent
          ),
      },
      {
        path: 'settings/app',
        loadComponent: () =>
          import('./admin/settings/app/app.component').then(
            (m) => m.AppComponent
          ),
      },
      {
        path: 'settings/roles',
        loadComponent: () =>
          import('./admin/settings/roles/roles.component').then(
            (m) => m.RolesComponent
          ),
      },
    ],
  },

  // 🚨 Fallback
  { path: '**', redirectTo: 'matières' },
  // { path: '', component: RegistrationComponent },
  // { path: 'inscription-ok', component: ConfirmationComponent },
  // {
  //   path: 'inscriptions-dashboard',
  //   loadComponent: () =>
  //     import(
  //       './admin/registration-dashboard/registration-dashboard.component'
  //     ).then((m) => m.RegistrationDashboardComponent),
  // },
];
