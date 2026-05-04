import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TravelRequestComponent } from './travel-request/travel-request.component';
import { ExpenseComponent } from './expense/expense.component';
import { MyRequestsComponent } from './my-requests/my-requests.component';

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
    path: 'expense/:tripId',
    component: ExpenseComponent,
  },
  {
    path: 'myrequests',
    component: MyRequestsComponent,
  },
];
