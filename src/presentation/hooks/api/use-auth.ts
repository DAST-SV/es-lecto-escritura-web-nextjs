// src/presentation/hooks/api/use-auth.ts
// Hooks de TanStack Query para autenticación

'use client';

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { apiClient } from '@/src/infrastructure/http';

// ============================================
// TIPOS
// ============================================

interface User {
  id: string;
  email: string | undefined;
  emailConfirmed: boolean;
  phone: string | null;
  createdAt: string;
  lastSignInAt: string | null;
  appMetadata: Record<string, any>;
  userMetadata: Record<string, any>;
}

interface AuthMeResponse {
  user: User | null;
  authenticated: boolean;
}

interface SessionResponse {
  session: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    expiresIn: number;
    tokenType: string;
    user: {
      id: string;
      email: string | undefined;
    };
  } | null;
  valid: boolean;
}

// ============================================
// QUERY KEYS
// ============================================

export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
  session: () => [...authKeys.all, 'session'] as const,
};

// ============================================
// HOOKS
// ============================================

/**
 * Obtiene el usuario actual autenticado
 */
export function useCurrentUser(
  options?: Omit<UseQueryOptions<AuthMeResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: () => apiClient.get<AuthMeResponse>('/api/v1/auth/me'),
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: false, // No reintentar si falla
    ...options,
  });
}

/**
 * Verifica si el usuario está autenticado
 */
export function useIsAuthenticated(
  options?: Omit<UseQueryOptions<AuthMeResponse>, 'queryKey' | 'queryFn'>
) {
  const query = useCurrentUser(options);

  return {
    ...query,
    isAuthenticated: query.data?.authenticated ?? false,
    user: query.data?.user ?? null,
  };
}

/**
 * Obtiene la sesión actual
 */
export function useSession(
  options?: Omit<UseQueryOptions<SessionResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: authKeys.session(),
    queryFn: () => apiClient.get<SessionResponse>('/api/v1/auth/session'),
    staleTime: 60 * 1000, // 1 minuto - las sesiones pueden expirar
    retry: false,
    ...options,
  });
}

/**
 * Hook combinado para auth state
 */
export function useAuth() {
  const userQuery = useCurrentUser();
  const sessionQuery = useSession();

  return {
    user: userQuery.data?.user ?? null,
    isAuthenticated: userQuery.data?.authenticated ?? false,
    session: sessionQuery.data?.session ?? null,
    isSessionValid: sessionQuery.data?.valid ?? false,
    isLoading: userQuery.isLoading || sessionQuery.isLoading,
    isError: userQuery.isError || sessionQuery.isError,
    error: userQuery.error || sessionQuery.error,
  };
}
