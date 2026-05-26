import { Routes } from '@angular/router';
import { authGuard } from './components/auth/auth.guard';
import { authRoutes } from './components/auth/auth.routes';

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
      import('./components/portal/employee/employee.routes').then(
        (m) => m.employeeRoutes,
      ),
  },
  {
    path: 'manager',
    canActivate: [authGuard],
    data: { role: 'manager' },
    loadChildren: () =>
      import('./components/portal/manager/manager.routes').then(
        (m) => m.managerRoutes,
      ),
  },
  {
    path: 'pm',
    canActivate: [authGuard],
    data: { role: 'projectmanager' },
    loadChildren: () =>
      import('./components/portal/manager/manager.routes').then(
        (m) => m.managerRoutes,
      ),
  },
  {
    path: 'finance',
    canActivate: [authGuard],
    data: { role: 'finance' },
    loadChildren: () =>
      import('./components/portal/finance/finance.routes').then(
        (m) => m.financeRoutes,
      ),
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    data: { role: 'admin' },
    loadChildren: () =>
      import('./components/portal/admin/admin.routes').then(
        (m) => m.adminRoutes,
      ),
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
