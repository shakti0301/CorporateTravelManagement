import { Routes } from '@angular/router';
import { authGuard } from './Components/auth/auth.guard';
import { authRoutes } from './Components/auth/auth.routes';

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
      import('./Components/portal/employee/employee.routes').then(
        (m) => m.employeeRoutes,
      ),
  },
  {
    path: 'manager',
    canActivate: [authGuard],
    data: { role: 'manager' },
    loadChildren: () =>
      import('./Components/portal/manager/manager.routes').then(
        (m) => m.managerRoutes,
      ),
  },
  {
    path: 'pm',
    canActivate: [authGuard],
    data: { role: 'projectmanager' },
    loadChildren: () =>
      import('./Components/portal/manager/manager.routes').then(
        (m) => m.managerRoutes,
      ),
  },
  {
    path: 'finance',
    canActivate: [authGuard],
    data: { role: 'finance' },
    loadChildren: () =>
      import('./Components/portal/finance/finance.routes').then(
        (m) => m.financeRoutes,
      ),
  },

  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
