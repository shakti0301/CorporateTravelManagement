import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ApprovalsComponent } from './approvals/approvals.component';
import { ReimbursementsComponent } from './reimbursements/reimbursements.component';

export const financeRoutes: Routes = [
  {
    path: '',
    component: DashboardComponent,
  },
  {
    path: 'approval',
    component: ApprovalsComponent,
  },
  {
    path: 'reimbursement',
    component: ReimbursementsComponent,
  },
];
