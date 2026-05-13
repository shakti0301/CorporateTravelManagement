import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ApprovalsComponent } from './approvals/approvals.component';

export const managerRoutes: Routes = [
  {
    path: '',
    component: DashboardComponent,
  },
  {
    path: 'approval',
    component: ApprovalsComponent,
  },
];
