// ============================================
// src/presentation/features/user-roles/hooks/useUserRoles.ts
// Hook: UserRole Management
// ============================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserRole } from '@/src/core/domain/entities/UserRole';
import { UserRoleRepository } from '@/src/infrastructure/repositories/user-roles/UserRoleRepository';
import {
  GetAllUserRolesUseCase,
  GetUserRoleByIdUseCase,
  GetUserRolesByUserIdUseCase,
  GetUsersByRoleIdUseCase,
  GetActiveUserRolesUseCase,
  AssignRoleToUserUseCase,
  RevokeRoleFromUserUseCase,
  UpdateUserRoleUseCase,
  DeleteUserRoleUseCase,
  ReactivateUserRoleUseCase,
} from '@/src/core/application/use-cases/user-roles';
import { AssignRoleDTO, RevokeRoleDTO, UpdateUserRoleDTO } from '@/src/core/domain/repositories/IUserRoleRepository';

export function useUserRoles(includeInactive: boolean = false) {
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const repository = new UserRoleRepository();

  const loadUserRoles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const useCase = new GetAllUserRolesUseCase(repository);
      const data = await useCase.execute(includeInactive);
      setUserRoles(data);
    } catch (err: any) {
      setError(err.message || 'Error loading user roles');
      console.error('Error loading user roles:', err);
    } finally {
      setLoading(false);
    }
  }, [includeInactive]);

  useEffect(() => {
    loadUserRoles();
  }, [loadUserRoles]);

  const getUserRoleById = async (id: string): Promise<UserRole | null> => {
    try {
      const useCase = new GetUserRoleByIdUseCase(repository);
      return await useCase.execute(id);
    } catch (err: any) {
      console.error('Error getting user role:', err);
      return null;
    }
  };

  const getUserRolesByUserId = async (userId: string, includeRevoked: boolean = false): Promise<UserRole[]> => {
    try {
      const useCase = new GetUserRolesByUserIdUseCase(repository);
      return await useCase.execute(userId, includeRevoked);
    } catch (err: any) {
      console.error('Error getting user roles by user:', err);
      return [];
    }
  };

  const getUsersByRoleId = async (roleId: string, includeRevoked: boolean = false): Promise<UserRole[]> => {
    try {
      const useCase = new GetUsersByRoleIdUseCase(repository);
      return await useCase.execute(roleId, includeRevoked);
    } catch (err: any) {
      console.error('Error getting users by role:', err);
      return [];
    }
  };

  const assignRole = async (dto: AssignRoleDTO): Promise<UserRole> => {
    try {
      const useCase = new AssignRoleToUserUseCase(repository);
      const newAssignment = await useCase.execute(dto);
      await loadUserRoles();
      return newAssignment;
    } catch (err: any) {
      const errorMessage = err.message || 'Error assigning role';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const revokeRole = async (id: string, dto: RevokeRoleDTO): Promise<void> => {
    try {
      const useCase = new RevokeRoleFromUserUseCase(repository);
      await useCase.execute(id, dto);
      await loadUserRoles();
    } catch (err: any) {
      const errorMessage = err.message || 'Error revoking role';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateUserRole = async (id: string, dto: UpdateUserRoleDTO): Promise<UserRole> => {
    try {
      const useCase = new UpdateUserRoleUseCase(repository);
      const updated = await useCase.execute(id, dto);
      await loadUserRoles();
      return updated;
    } catch (err: any) {
      const errorMessage = err.message || 'Error updating user role';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteUserRole = async (id: string): Promise<void> => {
    try {
      const useCase = new DeleteUserRoleUseCase(repository);
      await useCase.execute(id);
      await loadUserRoles();
    } catch (err: any) {
      const errorMessage = err.message || 'Error deleting user role';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const reactivateUserRole = async (id: string): Promise<UserRole> => {
    try {
      const useCase = new ReactivateUserRoleUseCase(repository);
      const reactivated = await useCase.execute(id);
      await loadUserRoles();
      return reactivated;
    } catch (err: any) {
      const errorMessage = err.message || 'Error reactivating user role';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const refresh = () => {
    loadUserRoles();
  };

  return {
    userRoles,
    loading,
    error,
    getUserRoleById,
    getUserRolesByUserId,
    getUsersByRoleId,
    assignRole,
    revokeRole,
    updateUserRole,
    deleteUserRole,
    reactivateUserRole,
    refresh,
  };
}
