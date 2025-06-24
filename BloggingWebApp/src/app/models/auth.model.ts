export interface User {
  id?: string;
  username: string;
  email: string;
  token?: string;
}

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
  user: User;
  token: string;
} 