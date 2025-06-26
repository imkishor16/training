export interface User {
  id: string;
  username: string;
  email: string;
  name?: string;
  role: UserRole;
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
  user: User;
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