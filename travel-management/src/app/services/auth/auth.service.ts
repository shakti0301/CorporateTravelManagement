import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  register(userData: any) {
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    let existingUser = users.find((user: any) => user.email === userData.email);

    if (existingUser) {
      alert('Email is already registered. Please use a different email.');
      return;
    }

    users.push(userData);
    localStorage.setItem('users', JSON.stringify(users));
  }

  login(email: string, password: string) {
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    let user = users.find(
      (u: any) => u.email === email && u.password === password,
    );

    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      return user;
    } else {
      return null;
    }
  }

  getRedirectPath(role: string): string {
    switch (role.toLowerCase()) {
      case 'employee':
        return '/employee';
      case 'projectmanager':
        return '/pm';
      case 'manager':
        return '/manager';
      case 'finance':
        return '/finance';
      default:
        return '/';
    }
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser') || 'null');
  }

  logout() {
    localStorage.removeItem('currentUser');
  }
}
