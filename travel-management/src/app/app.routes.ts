import { Routes } from '@angular/router';
import { authRoutes } from './auth/auth.routes';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    children: authRoutes,
  },
  {
    path: 'employee',
    canActivate: [authGuard],
    data: { role: 'employee' },
    loadChildren: () =>
      import('./dashboards/employee/employee.routes').then(
        (m) => m.employeeRoutes,
      ),
  },
  {
    path: 'manager',
    canActivate: [authGuard],
    data: { role: 'manager' },
    loadChildren: () =>
      import('./dashboards/manager/manager.routes').then(
        (m) => m.managerRoutes,
      ),
  },
  {
    path: 'finance',
    canActivate: [authGuard],
    data: { role: 'finance' },
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
