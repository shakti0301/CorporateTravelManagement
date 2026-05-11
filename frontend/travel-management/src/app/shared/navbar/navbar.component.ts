import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  user: any;
  menuOpen = false;
  mobileMenuOpen = false;

  ngOnInit(): void {
    const data = localStorage.getItem('currentUser');
    this.user = data ? JSON.parse(data) : null;
  }

  get dashboardRoute(): string {
    const role = this.user?.role?.toLowerCase();
    if (role === 'manager') return '/manager';
    if (role === 'projectmanager') return '/pm';
    if (role === 'finance') return '/finance';
    return '/employee';
  }

  get roleLabel(): string {
    const map: any = {
      employee: 'Employee',
      projectmanager: 'Project Manager',
      manager: 'Manager',
      finance: 'Finance',
    };
    return map[this.user?.role] || this.user?.role;
  }

  getInitials(): string {
    const name: string = this.user?.name ?? '';
    return name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.nx-avatar-wrap')) {
      this.menuOpen = false;
    }
    if (
      !target.closest('.nx-mobile-menu-btn') &&
      !target.closest('.nx-navbar__links')
    ) {
      this.mobileMenuOpen = false;
    }
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    alert('Logged out successfully!');
    window.location.href = '/';
  }
}
