import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ApprovalsComponent } from './approvals/approvals.component';
import { TravelRequestComponent } from './travel-request/travel-request.component';
import { MyRequestsComponent } from './my-requests/my-requests.component';
import { RequestDetailsComponent } from './request-details/request-details.component';
import { ExpenseComponent } from './expense/expense.component';
import { ItineraryComponent } from './itinerary/itinerary.component';

export const managerRoutes: Routes = [
  {
    path: '',
    component: DashboardComponent,
  },
  {
    path: 'approval',
    component: ApprovalsComponent,
  },
  {
    path: 'request',
    component: TravelRequestComponent,
  },
  {
    path: 'myrequests',
    component: MyRequestsComponent,
  },
  {
    path: 'request-details/:id',
    component: RequestDetailsComponent,
  },
  {
    path: 'expense/:id',
    component: ExpenseComponent,
  },
  {
    path: 'itinerary/:id',
    component: ItineraryComponent,
  },
];
