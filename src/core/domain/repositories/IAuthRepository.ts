// ============================================
// src/core/domain/repositories/IAuthRepository.ts
// ============================================
import type { User, Session, AuthError } from '@supabase/supabase-js';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  name?: string;
  role?: string;
  metadata?: Record<string, any>;
}

export type OAuthProvider = 'google' | 'apple' | 'azure' | 'facebook' | 'twitter' | 'spotify';

export interface AuthResult {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

export interface IAuthRepository {
  getCurrentUser(): Promise<User | null>;
  getCurrentSession(): Promise<Session | null>;
  login(credentials: LoginCredentials): Promise<AuthResult>;
  signup(credentials: SignupCredentials): Promise<AuthResult>;
  loginWithProvider(provider: OAuthProvider, redirectTo?: string): Promise<{ url: string }>;
  logout(): Promise<void>;
  onAuthStateChange(callback: (user: User | null) => void): () => void;
  isAuthenticated(): Promise<boolean>;
  resetPasswordForEmail(email: string, redirectTo: string): Promise<{ error: AuthError | null }>;
  updatePassword(newPassword: string): Promise<AuthResult>;
}