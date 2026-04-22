import { Routes } from '@angular/router';
import { authRoutes } from './auth/auth.routes';

import { DashboardComponent as EmployeeDashboard } from './dashboards/employee/dashboard/dashboard.component';
import { DashboardComponent as ManagerDashboard } from './dashboards/manager/dashboard/dashboard.component';
import { DashboardComponent as FinanceDashboard } from './dashboards/finance/dashboard/dashboard.component';

export const routes: Routes = [
  {
    path: '',
    children: authRoutes,
  },
  {
    path: 'employee',
    component: EmployeeDashboard,
  },
  {
    path: 'manager',
    component: ManagerDashboard,
  },
  {
    path: 'finance',
    component: FinanceDashboard,
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
