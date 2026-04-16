import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { EmployeeComponent } from '../employee/employee.component';
import { ManagerComponent } from '../manager/manager.component';
import { FinanceComponent } from '../finance/finance.component';

@Component({
  selector: 'app-dashboard-wrapper',
  standalone: true,
  imports: [CommonModule, EmployeeComponent, ManagerComponent, FinanceComponent],
  templateUrl: './dashboard-wrapper.component.html',
  styleUrl: './dashboard-wrapper.component.css'
})
export class DashboardWrapperComponent {
  authService = inject(AuthService);
  
  get role(): string | null {
    return this.authService.getUserRole();
  }
}
