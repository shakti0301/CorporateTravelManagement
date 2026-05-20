import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { RequestService } from '../../../../services/request/request.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NavbarComponent, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  role: string = '';
  allRequests: any[] = [];
  pendingList: any[] = [];

  constructor(
    private requestService: RequestService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.role = this.currentUser?.role?.toLowerCase() || 'manager';
    this.load();
  }

  load() {
    if (this.role === 'projectmanager') {
      // For cards
      this.requestService.getPMRequests().subscribe({
        next: (res: any) => {
          this.allRequests = res.map((r: any) => ({
            ...r,
            userEmail: r.employeeName,
            fromDate: r.startDate,
            toDate: r.endDate,
            cost: r.estimatedCost,

            pmStatus:
              r.status === 'Rejected'
                ? 'rejected'
                : r.currentStage === 'ProjectManager'
                  ? 'pending'
                  : 'approved',
          }));
        },
      });

      // For pending table
      this.requestService.getPendingPMRequests().subscribe({
        next: (res: any) => {
          this.pendingList = res.map((r: any) => ({
            ...r,
            userEmail: r.employeeName,
            fromDate: r.startDate,
            toDate: r.endDate,
            cost: r.estimatedCost,
          }));
        },
      });
    } else {
      // For cards
      this.requestService.getManagerRequests().subscribe({
        next: (res: any) => {
          this.allRequests = res.map((r: any) => ({
            ...r,
            userEmail: r.employeeName,
            fromDate: r.startDate,
            toDate: r.endDate,
            cost: r.estimatedCost,

            managerStatus:
              r.status === 'Rejected'
                ? 'rejected'
                : r.currentStage === 'Manager'
                  ? 'pending'
                  : 'approved',
          }));
        },
      });

      // Pending table
      this.requestService.getPendingManagerRequests().subscribe({
        next: (res: any) => {
          this.pendingList = res.map((r: any) => ({
            ...r,
            userEmail: r.employeeName,
            fromDate: r.startDate,
            toDate: r.endDate,
            cost: r.estimatedCost,
          }));
        },
      });
    }
  }

  createRequest() {
    const path =
      this.role === 'projectmanager' ? '/pm/request' : '/manager/request';
    this.router.navigate([path]);
  }

  // Stats
  get totalRequests(): number {
    return this.allRequests.filter((r) => !r.isDraft).length;
  }

  get pendingCount(): number {
    return this.pendingList.length;
  }

  get approvedThisMonth(): number {
    const now = new Date();
    return this.allRequests.filter((req) => {
      if (req.isDraft) return false;
      const status =
        this.role === 'projectmanager' ? req.pmStatus : req.managerStatus;
      if (this.normalize(status) !== 'approved') return false;
      const created = new Date(req.createdAt);
      return (
        created.getMonth() === now.getMonth() &&
        created.getFullYear() === now.getFullYear()
      );
    }).length;
  }

  get rejectedCount(): number {
    return this.allRequests.filter((req) => {
      if (req.isDraft) return false;
      const status =
        this.role === 'projectmanager' ? req.pmStatus : req.managerStatus;
      return this.normalize(status) === 'rejected';
    }).length;
  }

  // Show only first 5 in dashboard table
  get recentPending(): any[] {
    return this.pendingList.slice(0, 5);
  }

  goToApprovals() {
    const path =
      this.role === 'projectmanager' ? '/pm/approval' : '/manager/approval';
    this.router.navigate([path]);
  }

  getInitials(email: string): string {
    if (!email) return '?';
    return email.substring(0, 2).toUpperCase();
  }

  getAvatarColor(email: string): string {
    const colors = ['#4f46e5', '#0891b2', '#059669', '#d97706', '#7c3aed'];
    let hash = 0;
    for (let i = 0; i < email.length; i++) hash += email.charCodeAt(i);
    return colors[hash % colors.length];
  }

  normalize(status: string): string {
    return (status || '').trim().toLowerCase();
  }

  get pageTitle(): string {
    return 'Overview';
  }

  get pageSubtitle(): string {
    return this.role === 'projectmanager'
      ? "Review your team's travel requests assigned to you."
      : "Review your team's travel requests and financial metrics.";
  }
}
