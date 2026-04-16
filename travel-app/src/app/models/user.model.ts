export type UserRole = 'Employee' | 'Manager' | 'Finance';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  password?: string;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}
