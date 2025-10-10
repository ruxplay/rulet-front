export interface User {
    id: string;
    username: string;
    email: string;
    fullName: string;
    phone?: string;
    balance: number;
    wins: number;
    losses: number;
    role: 'user' | 'admin';
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
  }
  
  export interface LoginData {
    email: string;
    password: string;
  }
  
  export interface RegisterData {
    username: string;
    email: string;
    password: string;
    fullName: string;
    phone?: string;
  }
  
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}