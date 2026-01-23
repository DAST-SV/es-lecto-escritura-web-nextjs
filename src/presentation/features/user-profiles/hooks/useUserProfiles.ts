// ============================================
// src/presentation/features/user-profiles/hooks/useUserProfiles.ts
// Hook for managing user profiles
// ============================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserProfileRepository } from '@/src/infrastructure/repositories/user-profiles/UserProfileRepository';
import {
  GetAllUserProfilesUseCase,
  GetUserProfileByIdUseCase,
  GetUserProfileByUserIdUseCase,
  CreateUserProfileUseCase,
  UpdateUserProfileUseCase,
  DeleteUserProfileUseCase,
  CreateUserProfileDTO,
  UpdateUserProfileDTO,
  ProfileFilters
} from '@/src/core/application/use-cases/user-profiles';
import { UserProfile } from '@/src/core/domain/entities/UserProfile';

const repository = new UserProfileRepository();

export function useUserProfiles(filters?: ProfileFilters) {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const useCase = new GetAllUserProfilesUseCase(repository);
      const result = await useCase.execute(filters);

      setProfiles(result);
    } catch (err: any) {
      setError(err.message || 'Error loading profiles');
      console.error('Error in useUserProfiles:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createProfile = async (dto: CreateUserProfileDTO): Promise<UserProfile> => {
    try {
      setError(null);
      const useCase = new CreateUserProfileUseCase(repository);
      const result = await useCase.execute(dto);
      await fetchProfiles();
      return result;
    } catch (err: any) {
      setError(err.message || 'Error creating profile');
      throw err;
    }
  };

  const updateProfile = async (
    profileId: string,
    dto: UpdateUserProfileDTO,
    requestingUserId?: string
  ): Promise<UserProfile> => {
    try {
      setError(null);
      const useCase = new UpdateUserProfileUseCase(repository);
      const result = await useCase.execute(profileId, dto, requestingUserId);
      await fetchProfiles();
      return result;
    } catch (err: any) {
      setError(err.message || 'Error updating profile');
      throw err;
    }
  };

  const deleteProfile = async (
    profileId: string,
    requestingUserId?: string
  ): Promise<void> => {
    try {
      setError(null);
      const useCase = new DeleteUserProfileUseCase(repository);
      await useCase.execute(profileId, requestingUserId);
      await fetchProfiles();
    } catch (err: any) {
      setError(err.message || 'Error deleting profile');
      throw err;
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  return {
    profiles,
    loading,
    error,
    createProfile,
    updateProfile,
    deleteProfile,
    refresh: fetchProfiles,
  };
}

// ============================================
// Hook for single profile by ID
// ============================================

export function useUserProfile(profileId?: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!profileId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const useCase = new GetUserProfileByIdUseCase(repository);
      const result = await useCase.execute(profileId);

      setProfile(result);
    } catch (err: any) {
      setError(err.message || 'Error loading profile');
      console.error('Error in useUserProfile:', err);
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    refresh: fetchProfile,
  };
}

// ============================================
// Hook for profile by user ID
// ============================================

export function useUserProfileByUserId(userId?: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const useCase = new GetUserProfileByUserIdUseCase(repository);
      const result = await useCase.execute(userId);

      setProfile(result);
    } catch (err: any) {
      setError(err.message || 'Error loading profile');
      console.error('Error in useUserProfileByUserId:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const updateProfile = async (
    dto: UpdateUserProfileDTO
  ): Promise<UserProfile> => {
    if (!profile) {
      throw new Error('No profile to update');
    }

    try {
      setError(null);
      const useCase = new UpdateUserProfileUseCase(repository);
      const result = await useCase.execute(profile.id, dto, userId);
      await fetchProfile();
      return result;
    } catch (err: any) {
      setError(err.message || 'Error updating profile');
      throw err;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    updateProfile,
    refresh: fetchProfile,
  };
}
