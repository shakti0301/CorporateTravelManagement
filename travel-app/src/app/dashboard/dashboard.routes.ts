import { Routes } from '@angular/router';
import { authGuard } from '../guards/auth.guard';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./dashboard-wrapper/dashboard-wrapper.component').then(m => m.DashboardWrapperComponent),
    canActivate: [authGuard]
  }
];
