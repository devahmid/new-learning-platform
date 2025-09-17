import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Composants
import { ProgressDashboardComponent } from '../components/progress-dashboard/progress-dashboard.component';
import { ParentProgressOverviewComponent } from '../components/parent-progress-overview/parent-progress-overview.component';

const routes: Routes = [
  {
    path: 'progress',
    children: [
      {
        path: 'parent',
        component: ParentProgressOverviewComponent,
        title: 'Vue d\'ensemble - Progression'
      },
      {
        path: 'child/:childId',
        component: ProgressDashboardComponent,
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
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProgressRoutingModule { }
