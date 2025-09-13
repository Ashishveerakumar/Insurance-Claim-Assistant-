export interface User {
  id?: string;
  name: string;
  email: string;
  role?: string;
  createdAt?: string;
}

export interface AuthResponse {
  ok: boolean;
  message?: string;
  user?: User;
  tokens?: {
    access: string;
    refresh: string;
  };
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}