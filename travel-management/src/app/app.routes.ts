import { Routes } from '@angular/router';
import { authRoutes } from './auth/auth.routes';

export const routes: Routes = [
  {
    path: '',
    children: authRoutes,
  },
  {
    path: 'employee',
    loadChildren: () =>
      import('./dashboards/employee/employee.routes').then(
        (m) => m.employeeRoutes,
      ),
  },
  {
    path: 'manager',
    loadChildren: () =>
      import('./dashboards/manager/manager.routes').then(
        (m) => m.managerRoutes,
      ),
  },
  {
    path: 'finance',
    loadChildren: () =>
      import('./dashboards/finance/finance.routes').then(
        (m) => m.financeRoutes,
      ),
  },

  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
