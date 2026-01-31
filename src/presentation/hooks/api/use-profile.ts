// src/presentation/hooks/api/use-profile.ts
// Hooks de TanStack Query para perfiles de usuario

'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { apiClient } from '@/src/infrastructure/http';
import { authKeys } from './use-auth';

// ============================================
// TIPOS
// ============================================

interface UserProfile {
  id: string;
  userId: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  dateOfBirth: string | null;
  phoneNumber: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  isPublic: boolean;
  preferences: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

interface ProfileResponse {
  profile: UserProfile | null;
  exists: boolean;
}

interface PublicProfileResponse {
  profile: Partial<UserProfile>;
  limited: boolean;
}

interface CreateProfileData {
  displayName: string;
  bio?: string | null;
  avatarUrl?: string | null;
  dateOfBirth?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  isPublic?: boolean;
  preferences?: Record<string, any>;
}

interface UpdateProfileData {
  displayName?: string;
  bio?: string | null;
  avatarUrl?: string | null;
  dateOfBirth?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  isPublic?: boolean;
  preferences?: Record<string, any>;
}

// ============================================
// QUERY KEYS
// ============================================

export const profileKeys = {
  all: ['profiles'] as const,
  my: () => [...profileKeys.all, 'my'] as const,
  public: () => [...profileKeys.all, 'public'] as const,
  publicById: (id: string) => [...profileKeys.public(), id] as const,
};

// ============================================
// HOOKS DE QUERY
// ============================================

/**
 * Obtiene el perfil del usuario autenticado
 */
export function useMyProfile(
  options?: Omit<UseQueryOptions<ProfileResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: profileKeys.my(),
    queryFn: () => apiClient.get<ProfileResponse>('/api/v1/users/profile'),
    ...options,
  });
}

/**
 * Obtiene el perfil público de un usuario
 */
export function usePublicProfile(
  userId: string,
  options?: Omit<UseQueryOptions<PublicProfileResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: profileKeys.publicById(userId),
    queryFn: () => apiClient.get<PublicProfileResponse>(`/api/v1/users/${userId}`),
    enabled: !!userId,
    ...options,
  });
}

// ============================================
// HOOKS DE MUTACIÓN
// ============================================

/**
 * Crea el perfil del usuario
 */
export function useCreateProfile(
  options?: UseMutationOptions<{ profile: UserProfile; message: string }, Error, CreateProfileData>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProfileData) =>
      apiClient.post<{ profile: UserProfile; message: string }>('/api/v1/users/profile', data),
    onSuccess: (data) => {
      // Actualizar caché del perfil
      queryClient.setQueryData(profileKeys.my(), {
        profile: data.profile,
        exists: true,
      });
      // Invalidar datos de auth (pueden depender del perfil)
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
    ...options,
  });
}

/**
 * Actualiza el perfil del usuario
 */
export function useUpdateProfile(
  options?: UseMutationOptions<{ profile: UserProfile; message: string }, Error, UpdateProfileData>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileData) =>
      apiClient.put<{ profile: UserProfile; message: string }>('/api/v1/users/profile', data),
    onSuccess: (data) => {
      // Actualizar caché del perfil
      queryClient.setQueryData(profileKeys.my(), {
        profile: data.profile,
        exists: true,
      });
    },
    ...options,
  });
}

/**
 * Hook combinado para perfil con estado de mutación
 */
export function useProfile() {
  const profileQuery = useMyProfile();
  const createMutation = useCreateProfile();
  const updateMutation = useUpdateProfile();

  return {
    profile: profileQuery.data?.profile ?? null,
    exists: profileQuery.data?.exists ?? false,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    error: profileQuery.error,
    create: createMutation.mutate,
    createAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    update: updateMutation.mutate,
    updateAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}
