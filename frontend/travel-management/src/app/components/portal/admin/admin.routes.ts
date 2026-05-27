import { Route } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UsersComponent } from './users/users.component';
import { RequestsComponent } from './requests/requests.component';
import { RegisterComponent } from './register/register.component';
import { PoliciesComponent } from './policies/policies.component';

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
  {
    path: 'policies',
    component: PoliciesComponent,
  },
];

