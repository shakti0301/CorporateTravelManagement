import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { RequestService } from '../../../../services/request/request.service';
import { ReimbursementService } from '../../../../services/reimbursement/reimbursement.service';

@Component({
  selector: 'app-requests',
  standalone: true,
  imports: [NavbarComponent, CommonModule, FormsModule],
  templateUrl: './requests.component.html',
  styleUrl: './requests.component.css',
})
export class RequestsComponent implements OnInit {
  allRequests: any[] = [];
  allReimbursements: any[] = [];
  loading = true;

  // Filters
  searchQuery = '';
  selectedRole = '';
  selectedStatus = '';

  // Pagination
  pageSize = 4;
  currentPage = 1;

  constructor(
    private requestService: RequestService,
    private reimbursementService: ReimbursementService,
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.requestService.getAllRequestsForAdmin().subscribe({
      next: (res: any) => {
        this.allRequests = Array.isArray(res) ? res : [];

        this.reimbursementService.getFinanceReimbursements().subscribe({
          next: (reimbursements: any) => {
            this.allReimbursements = Array.isArray(reimbursements)
              ? reimbursements
              : [];
            this.loading = false;
          },
          error: () => {
            this.allReimbursements = [];
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
  get totalRequests(): number {
    return this.allRequests.length;
  }

  get pendingApproval(): number {
    return this.allRequests.filter(
      (r) =>
        !['approved', 'rejected', 'draft'].includes(this.normalize(r.status)),
    ).length;
  }

  get newRequests(): number {
    return this.allRequests.filter(
      (r) =>
        this.normalize(r.status) === 'pending' &&
        ['manager', 'projectmanager', 'finance'].includes(this.getUserRole(r)),
    ).length;
  }

  get totalEstimatedCost(): string {
    const total = this.allRequests.reduce(
      (sum, r) => sum + Number(r.estimatedCost || r.cost || 0),
      0,
    );
    return this.formatMoney(total);
  }

  get totalReimbursements(): number {
    return this.allReimbursements.length;
  }

  // ── FILTER + SEARCH ──
  get filteredList(): any[] {
    return this.allRequests.filter((r) => {
      const q = this.searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        this.getEmployeeName(r).toLowerCase().includes(q) ||
        this.getEmail(r).toLowerCase().includes(q) ||
        this.getTripId(r).toLowerCase().includes(q);

      const matchRole =
        !this.selectedRole ||
        this.normalize(r.userRole || r.role || '') ===
          this.normalize(this.selectedRole);

      const matchStatus =
        !this.selectedStatus ||
        this.normalize(r.status) === this.normalize(this.selectedStatus);

      return matchSearch && matchRole && matchStatus;
    });
  }

  // ── PAGINATION ──
  get totalPages(): number {
    return Math.ceil(this.filteredList.length / this.pageSize) || 1;
  }

  get paginatedList(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredList.slice(start, start + this.pageSize);
  }

  get pageNumbers(): number[] {
    const total = this.totalPages;
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    if (this.currentPage <= 3) return [1, 2, 3];
    if (this.currentPage >= total - 2) return [total - 2, total - 1, total];
    return [this.currentPage - 1, this.currentPage, this.currentPage + 1];
  }

  get showEndEllipsis(): boolean {
    return this.totalPages > 5 && this.currentPage < this.totalPages - 2;
  }

  get showingText(): string {
    const total = this.filteredList.length;
    if (total === 0) return 'No results';
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, total);
    return `Showing <strong>${start} to ${end}</strong> of <strong>${total.toLocaleString()}</strong> requests`;
  }

  goToPage(p: number) {
    if (p >= 1 && p <= this.totalPages) this.currentPage = p;
  }

  prevPage() {
    this.goToPage(this.currentPage - 1);
  }
  nextPage() {
    this.goToPage(this.currentPage + 1);
  }

  onFilterChange() {
    this.currentPage = 1;
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedRole = '';
    this.selectedStatus = '';
    this.currentPage = 1;
  }

  // ── HELPERS ──
  getTripId(req: any): string {
    return req.tripId || `#TR-${req.travelRequestId || req.id}`;
  }

  getEmployeeName(req: any): string {
    return req.employeeName || req.userName || req.name || 'Unknown';
  }

  getEmail(req: any): string {
    return req.employeeEmail || req.userEmail || req.email || '';
  }

  getDestination(req: any): string {
    return req.destination || req.toLocation || '—';
  }

  getAmount(req: any): number {
    return Number(req.estimatedCost || req.cost || 0);
  }

  formatMoney(amount: number): string {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}k`;
    return `₹${amount}`;
  }

  getUserRole(req: any): string {
    return this.normalize(req.userRole || req.role || 'employee');
  }

  getRoleLabel(role: string): string {
    const map: any = {
      employee: 'EMPLOYEE',
      manager: 'MANAGER',
      finance: 'FINANCE',
      projectmanager: 'PROJECT MANAGER',
      admin: 'ADMIN',
    };
    return map[this.normalize(role)] || role.toUpperCase();
  }

  getRoleClass(role: string): string {
    const map: any = {
      employee: 'role-employee',
      manager: 'role-manager',
      finance: 'role-finance',
      projectmanager: 'role-pm',
      admin: 'role-admin',
    };
    return map[this.normalize(role)] || 'role-employee';
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
    if (s === 'approved') return 'Approved';
    if (s === 'rejected') return 'Rejected';
    if (s === 'draft') return 'Draft';
    return 'Pending';
  }

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
    ];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) hash += name.charCodeAt(i);
    return colors[hash % colors.length];
  }

  normalize(s: string): string {
    return (s || '').trim().toLowerCase();
  }
}
