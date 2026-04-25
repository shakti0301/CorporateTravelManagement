import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TravelRequestComponent } from './travel-request/travel-request.component';
import { ExpenseComponent } from './expense/expense.component';

export const employeeRoutes: Routes = [
  {
    path: '',
    component: DashboardComponent,
  },
  {
    path: 'request',
    component: TravelRequestComponent,
  },
  {
    path: 'expense/:id',
    component: ExpenseComponent,
  },
];
