import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/Auth`;

  constructor(private http: HttpClient) {}

  // Register API
  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  // Login API
  login(loginData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, loginData);
  }

  // Redirect Based On Role

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

      case 'admin':
        return '/admin';

      default:
        return '/';
    }
  }

  // Current User
  getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser') || 'null');
  }

  getAllUsers() {
    return this.http.get(`${environment.apiUrl}/Auth/users`);
  }

  createUser(userData: any) {
    return this.http.post(`${this.apiUrl}/admin/create`, userData);
  }

  updateUser(userId: number, userData: any) {
    return this.http.put(`${this.apiUrl}/admin/users/${userId}`, userData);
  }

  // Logout
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
  }

  // Change Password
  changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, data);
  }
}
