export interface User {
  id: string;
  username: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  role: UserRole;
  status?: string;
  isSuspended?: boolean;
  suspensionReason?: string;
  suspendedUntil?: string;
  createdAt?: string;
  lastLoginAt?: string;
}

export type UserRole = 'Admin' | 'User';

export interface SignUpRequest {
  username: string;
  email: string;
  password: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  email: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  name?: string;
} 