import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Routes
const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'parent',
        loadComponent: () =>
          import('../components/progress-test/progress-test.component').then(
            (m) => m.ProgressTestComponent
          ),
        title: 'Vue d\'ensemble - Progression'
      },
      {
        path: 'child/:childId',
        loadComponent: () =>
          import('../components/progress-dashboard/progress-dashboard.component').then(
            (m) => m.ProgressDashboardComponent
          ),
        title: 'Progression détaillée'
      },
      {
        path: '',
        redirectTo: 'parent',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ]
})
export class ProgressModule { }
