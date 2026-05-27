import { Route } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UsersComponent } from './users/users.component';
import { RequestsComponent } from './requests/requests.component';
import { RegisterComponent } from '../../auth/register/register.component';

export const adminRoutes: Route[] = [
  {
    path: '',
    component: DashboardComponent,
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
  },
  {
    path: 'users',
    component: UsersComponent,
  },
  {
    path: 'requests',
    component: RequestsComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
];
