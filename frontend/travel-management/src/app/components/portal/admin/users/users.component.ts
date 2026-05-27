import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { AuthService } from '../../../../services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [NavbarComponent, CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
})
export class UsersComponent implements OnInit {
  allUsers: any[] = [];
  loading = true;

  activeTab: 'employee' | 'projectmanager' | 'manager' | 'finance' = 'employee';
  searchQuery = '';

  // Pagination
  pageSize = 10;
  currentPage = 1;

  // Add User Modal
  showAddModal = false;
  addSubmitted = false;
  newUser = {
    name: '',
    email: '',
    role: 'employee',
    department: '',
    password: '',
  };

  // Edit Modal
  showEditModal = false;
  editSubmitted = false;
  selectedUser: any = null;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.authService.getAllUsers().subscribe({
      next: (res: any) => {
        this.allUsers = Array.isArray(res) ? res : [];
        this.loading = false;
      },
      error: () => {
        this.allUsers = [];
        this.loading = false;
      },
    });
  }

  // STATS
  get totalEmployees(): number {
    return this.allUsers.filter((u) => this.normalize(u.role) === 'employee')
      .length;
  }

  get pendingApprovals(): number {
    return this.allUsers.filter((u) => this.normalize(u.status) === 'pending')
      .length;
  }

  get adminsManagers(): number {
    return this.allUsers.filter((u) =>
      ['manager', 'projectmanager', 'admin', 'finance'].includes(
        this.normalize(u.role),
      ),
    ).length;
  }

  get activeRolesCount(): number {
    const roles = new Set(this.allUsers.map((u) => this.normalize(u.role)));
    return roles.size;
  }

  // TABS
  setTab(tab: 'employee' | 'projectmanager' | 'manager' | 'finance') {
    this.activeTab = tab;
    this.currentPage = 1;
    this.searchQuery = '';
  }

  get tabUsers(): any[] {
    return this.allUsers.filter(
      (u) => this.normalize(u.role) === this.activeTab,
    );
  }

  // SEARCH
  get filteredUsers(): any[] {
    if (!this.searchQuery.trim()) return this.tabUsers;
    const q = this.searchQuery.toLowerCase();
    return this.tabUsers.filter(
      (u) =>
        (u.name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.department || '').toLowerCase().includes(q),
    );
  }

  // PAGINATION
  get totalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.pageSize) || 1;
  }

  get paginatedUsers(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredUsers.slice(start, start + this.pageSize);
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
    const total = this.filteredUsers.length;
    if (total === 0) return 'No results';
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, total);
    return `Showing ${start} to ${end} of ${total.toLocaleString()} results`;
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
  onSearch() {
    this.currentPage = 1;
  }

  // ADD USER MODAL
  openAddModal() {
    this.router.navigate(['/admin/register']);
  }

  closeAddModal() {
    this.showAddModal = false;
    this.addSubmitted = false;
  }

  saveNewUser() {
    this.addSubmitted = true;

    if (
      !this.newUser.name ||
      !this.newUser.email ||
      !this.newUser.password ||
      !this.newUser.role
    ) {
      return;
    }

    const roleMap: any = {
      employee: 2,
      manager: 3,
      finance: 4,
      projectmanager: 5,
      admin: 1,
    };

    const registerData = {
      userName: this.newUser.name,
      email: this.newUser.email,
      password: this.newUser.password,
      roleId: roleMap[this.newUser.role],
      departmentId: Number(this.newUser.department) || 1,
      managerId: null,
    };

    this.authService.register(registerData).subscribe({
      next: () => {
        alert('User created successfully');
        this.closeAddModal();
        this.load(); // refresh users
      },

      error: (err) => {
        console.log(err);
        alert('Failed to create user');
      },
    });
  }

  // EDIT USER MODAL
  openEditModal(user: any) {
    this.selectedUser = { ...user };
    this.editSubmitted = false;
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedUser = null;
    this.editSubmitted = false;
  }

  saveEditUser() {
    this.editSubmitted = true;
    if (!this.selectedUser?.name || !this.selectedUser?.email) return;
    this.authService
      .updateUser(
        this.selectedUser.userId || this.selectedUser.id,
        this.selectedUser,
      )
      .subscribe({
        next: () => {
          this.closeEditModal();
          this.load();
        },
        error: () => alert('Failed to update user.'),
      });
  }

  toggleStatus(user: any) {
    const newStatus =
      this.normalize(user.status) === 'active' ? 'inactive' : 'active';
    this.authService
      .updateUser(user.userId || user.id, { ...user, status: newStatus })
      .subscribe({
        next: () => this.load(),
        error: () => alert('Failed to update status.'),
      });
  }

  // HELPERS
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

  getStatusClass(status: string): string {
    const s = this.normalize(status);
    if (s === 'active') return 'status-active';
    if (s === 'inactive') return 'status-inactive';
    return 'status-pending';
  }

  getStatusLabel(status: string): string {
    const s = this.normalize(status);
    if (s === 'active') return 'Active';
    if (s === 'inactive') return 'Inactive';
    return 'Pending';
  }

  getTabCount(tab: string): number {
    return this.allUsers.filter((u) => this.normalize(u.role) === tab).length;
  }

  normalize(s: string): string {
    return (s || '').trim().toLowerCase();
  }
}
