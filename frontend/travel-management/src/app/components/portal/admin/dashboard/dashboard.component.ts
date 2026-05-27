import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { RequestService } from '../../../../services/request/request.service';
import { AuthService } from '../../../../services/auth/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [NavbarComponent, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  allRequests: any[] = [];
  allUsers: any[] = [];
  loading = true;

  // Pagination for recent requests table
  pageSize = 5;
  currentPage = 1;

  constructor(
    private requestService: RequestService,
    private authService: AuthService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;

    this.requestService.getAllRequestsForAdmin().subscribe({
      next: (res: any) => {
        this.allRequests = Array.isArray(res) ? res : [];

        this.authService.getAllUsers().subscribe({
          next: (users: any) => {
            this.allUsers = Array.isArray(users) ? users : [];
            console.log('All Users:', this.allUsers);
            this.loading = false;
          },

          error: () => {
            this.allUsers = [];
            this.loading = false;
          },
        });
      },

      error: () => {
        this.allRequests = [];
        this.loading = false;
      },
    });
  }
  // ── STATS ──
  get totalUsers(): number {
    return this.allUsers.length;
  }

  get totalRequests(): number {
    return this.allRequests.length;
  }

  get pendingApprovals(): number {
    return this.allRequests.filter(
      (r) =>
        this.normalize(r.status) !== 'approved' &&
        this.normalize(r.status) !== 'rejected' &&
        this.normalize(r.status) !== 'draft',
    ).length;
  }

  get totalSpend(): number {
    return this.allRequests
      .filter((r) => this.normalize(r.status) === 'approved')
      .reduce((sum, r) => sum + Number(r.estimatedCost || r.cost || 0), 0);
  }

  get totalSpendLabel(): string {
    const amount = this.totalSpend;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount}`;
  }

  // ── RECENT REQUESTS ──
  get recentRequests(): any[] {
    return [...this.allRequests]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 8);
  }

  get paginatedRequests(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.recentRequests.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.recentRequests.length / this.pageSize) || 1;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }
  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  // ── SYSTEM USERS (top 4 for sidebar) ──
  get systemUsers(): any[] {
    return this.allUsers.slice(0, 4);
  }

  // ── HELPERS ──
  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  }

  getAvatarColor(name: string): string {
    const colors = [
      '#4f46e5',
      '#0891b2',
      '#059669',
      '#d97706',
      '#7c3aed',
      '#db2777',
      '#ea580c',
      '#0284c7',
    ];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) hash += name.charCodeAt(i);
    return colors[hash % colors.length];
  }

  getRoleLabel(role: string): string {
    const map: any = {
      employee: 'Employee',
      manager: 'Manager',
      finance: 'Finance Manager',
      projectmanager: 'Project Lead',
      admin: 'Travel Admin',
    };
    return map[this.normalize(role)] || role;
  }

  getStatusClass(status: string): string {
    const s = this.normalize(status);
    if (s === 'approved') return 'status-approved';
    if (s === 'rejected') return 'status-rejected';
    if (s === 'draft') return 'status-draft';
    return 'status-pending';
  }

  getStatusLabel(status: string): string {
    const s = this.normalize(status);
    if (s === 'approved') return 'APPROVED';
    if (s === 'rejected') return 'REJECTED';
    if (s === 'draft') return 'DRAFT';
    return 'PENDING';
  }

  isOnline(user: any): boolean {
    // Simulate online status based on user index for display
    return user.isActive !== false;
  }

  normalize(s: string): string {
    return (s || '').trim().toLowerCase();
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  getDestination(req: any): string {
    return req.destination || req.toLocation || 'N/A';
  }

  getEmployeeName(req: any): string {
    return req.employeeName || req.userName || req.userEmail || 'Unknown';
  }

  getDepartment(req: any): string {
    return req.department || req.userDepartment || 'Team';
  }
}
