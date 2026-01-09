// ============================================
// src/presentation/features/auth/hooks/useAuth.ts
// Hook COMPLETO para páginas de autenticación
// ============================================
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { AuthState } from '@/src/core/domain/value-objects/AuthState';
import { GetCurrentUser } from '@/src/core/application/use-cases/auth/GetCurrentUser';
import { Login } from '@/src/core/application/use-cases/auth/Login';
import { Signup } from '@/src/core/application/use-cases/auth/Signup';
import { Logout } from '@/src/core/application/use-cases/auth/Logout';
import { LoginWithProvider } from '@/src/core/application/use-cases/auth/LoginWithProvider';
import { SupabaseAuthRepository } from '@/src/infrastructure/repositories/SupabaseAuthRepository';
import type { LoginCredentials, SignupCredentials, OAuthProvider } from '@/src/core/domain/repositories/IAuthRepository';
import { DomainAuthError } from '@/src/core/domain/errors/AuthError';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>(AuthState.initial());

  const authRepository = new SupabaseAuthRepository();
  const getCurrentUser = new GetCurrentUser(authRepository);
  const loginUseCase = new Login(authRepository);
  const signupUseCase = new Signup(authRepository);
  const logoutUseCase = new Logout(authRepository);
  const loginWithProviderUseCase = new LoginWithProvider(authRepository);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser.execute();
        
        if (currentUser) {
          setAuthState(AuthState.authenticated(currentUser));
        } else {
          setAuthState(AuthState.unauthenticated());
        }
      } catch (error) {
        console.error('Error al obtener usuario:', error);
        setAuthState(AuthState.unauthenticated());
      }
    };

    fetchUser();

    const unsubscribe = authRepository.onAuthStateChange((user) => {
      if (user) {
        setAuthState(AuthState.authenticated(user));
      } else {
        setAuthState(AuthState.unauthenticated());
      }
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setAuthState(new AuthState(authState.user, true, null));
      
      const result = await loginUseCase.execute(credentials);
      
      if (result.user) {
        setAuthState(AuthState.authenticated(result.user));
      } else {
        setAuthState(AuthState.withError('No se pudo iniciar sesión'));
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof DomainAuthError 
        ? error.message 
        : 'Error inesperado al iniciar sesión';
      
      setAuthState(AuthState.withError(errorMessage));
      throw error;
    }
  }, [authState.user]);

  const signup = useCallback(async (credentials: SignupCredentials) => {
    try {
      setAuthState(new AuthState(authState.user, true, null));
      
      const result = await signupUseCase.execute(credentials);
      
      if (result.user) {
        setAuthState(AuthState.authenticated(result.user));
      } else {
        setAuthState(AuthState.withError('No se pudo registrar'));
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof DomainAuthError 
        ? error.message 
        : 'Error inesperado al registrarse';
      
      setAuthState(AuthState.withError(errorMessage));
      throw error;
    }
  }, [authState.user]);

  const loginWithProvider = useCallback(async (
    provider: OAuthProvider,
    redirectTo?: string
  ) => {
    try {
      return await loginWithProviderUseCase.execute(provider, redirectTo);
    } catch (error) {
      const errorMessage = error instanceof DomainAuthError 
        ? error.message 
        : `Error al iniciar sesión con ${provider}`;
      
      setAuthState(AuthState.withError(errorMessage));
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUseCase.execute();
      setAuthState(AuthState.unauthenticated());
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  }, []);

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    error: authState.error,
    login,
    signup,
    loginWithProvider,
    logout,
  };
};