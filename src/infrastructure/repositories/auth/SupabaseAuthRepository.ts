// ============================================
// src/infrastructure/repositories/SupabaseAuthRepository.ts
// ============================================
import type { User, Session, SupabaseClient } from '@supabase/supabase-js';
import {
  IAuthRepository,
  LoginCredentials,
  SignupCredentials,
  OAuthProvider,
  AuthResult,
} from '@/src/core/domain/repositories/IAuthRepository';

export class SupabaseAuthRepository implements IAuthRepository {
  constructor(private supabase: SupabaseClient) {}

  async getCurrentUser(): Promise<User | null> {
    const { data, error } = await this.supabase.auth.getUser();
    
    if (error || !data.user) {
      return null;
    }

    return data.user;
  }

  async getCurrentSession(): Promise<Session | null> {
    const { data, error } = await this.supabase.auth.getSession();
    
    if (error || !data.session) {
      return null;
    }

    return data.session;
  }

  async login(credentials: LoginCredentials): Promise<AuthResult> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    return {
      user: data.user,
      session: data.session,
      error: error,
    };
  }

  async signup(credentials: SignupCredentials): Promise<AuthResult> {
    const signupOptions: any = {
      email: credentials.email,
      password: credentials.password,
    };

    // Add user metadata if provided
    if (credentials.name || credentials.role || credentials.metadata) {
      signupOptions.options = {
        data: {
          full_name: credentials.name,
          role: credentials.role,
          ...credentials.metadata,
        },
      };
    }

    const { data, error } = await this.supabase.auth.signUp(signupOptions);

    return {
      user: data.user,
      session: data.session,
      error: error,
    };
  }

  async loginWithProvider(
    provider: OAuthProvider,
    redirectTo?: string
  ): Promise<{ url: string }> {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: provider === 'azure' ? 'azure' : provider,
      options: {
        redirectTo,
      },
    });

    if (error) {
      throw error;
    }

    return { url: data.url };
  }

  async logout(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();
    
    if (error) {
      throw error;
    }
  }

  onAuthStateChange(callback: (user: User | null) => void): () => void {
    const {
      data: { subscription },
    } = this.supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }

  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }
}