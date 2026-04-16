import { Injectable } from '@angular/core';
import { LoginCredentials, User, UserRole } from '../models/user.model';
import { Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly USERS_KEY = 'travel_app_users';
  private readonly SESSION_KEY = 'travel_app_session';

  constructor() {
    this.initializeDefaultUsers();
  }

  private initializeDefaultUsers(): void {
    const users = this.getUsersFromStorage();
    if (users.length === 0) {
      // Setup some default mock users right away
      users.push({ id: '1', email: 'emp@test.com', password: 'password123', role: 'Employee' });
      users.push({ id: '2', email: 'mgr@test.com', password: 'password123', role: 'Manager' });
      users.push({ id: '3', email: 'fin@test.com', password: 'password123', role: 'Finance' });
      this.saveUsersToStorage(users);
    }
  }

  private getUsersFromStorage(): User[] {
    const usersJson = localStorage.getItem(this.USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  }

  private saveUsersToStorage(users: User[]): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  register(user: User): Observable<boolean> {
    const users = this.getUsersFromStorage();
    const exists = users.find((u) => u.email === user.email);
    if (exists) {
      return throwError(() => new Error('Email already registered'));
    }

    user.id = Math.random().toString(36).substring(2, 9);
    users.push(user);
    this.saveUsersToStorage(users);
    return of(true);
  }

  login(credentials: LoginCredentials): Observable<User> {
    const users = this.getUsersFromStorage();
    const user = users.find(
      (u) => u.email === credentials.email && u.password === credentials.password,
    );

    if (user) {
      const sessionUser = { ...user };
      delete sessionUser.password; // Don't store password in session
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionUser));
      return of(sessionUser);
    }
    return throwError(() => new Error('Invalid email or password'));
  }

  logout(): void {
    localStorage.removeItem(this.SESSION_KEY);
  }

  getCurrentUser(): User | null {
    const sessionJson = localStorage.getItem(this.SESSION_KEY);
    return sessionJson ? JSON.parse(sessionJson) : null;
  }

  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  getUserRole(): UserRole | null {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }
}
