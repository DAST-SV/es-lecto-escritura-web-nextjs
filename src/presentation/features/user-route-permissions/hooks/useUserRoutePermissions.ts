// ============================================
// src/presentation/features/user-route-permissions/hooks/useUserRoutePermissions.ts
// Hook: UserRoutePermission Management
// ============================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserRoutePermission } from '@/src/core/domain/entities/UserRoutePermission';
import { UserRoutePermissionRepository } from '@/src/infrastructure/repositories/user-route-permissions/UserRoutePermissionRepository';
import {
  GetAllUserRoutePermissionsUseCase,
  GetUserRoutePermissionByIdUseCase,
  GetUserRoutePermissionsByUserUseCase,
  CreateUserRoutePermissionUseCase,
  UpdateUserRoutePermissionUseCase,
  DeleteUserRoutePermissionUseCase,
} from '@/src/core/application/use-cases/user-route-permissions';
import { CreateUserRoutePermissionDTO, UpdateUserRoutePermissionDTO } from '@/src/core/domain/repositories/IUserRoutePermissionRepository';

export function useUserRoutePermissions(includeInactive: boolean = false) {
  const [permissions, setPermissions] = useState<UserRoutePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const repository = new UserRoutePermissionRepository();

  const loadPermissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const useCase = new GetAllUserRoutePermissionsUseCase(repository);
      const data = await useCase.execute(includeInactive);
      setPermissions(data);
    } catch (err: any) {
      setError(err.message || 'Error loading permissions');
    } finally {
      setLoading(false);
    }
  }, [includeInactive]);

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  const createPermission = async (dto: CreateUserRoutePermissionDTO): Promise<UserRoutePermission> => {
    try {
      const useCase = new CreateUserRoutePermissionUseCase(repository);
      const newPerm = await useCase.execute(dto);
      await loadPermissions();
      return newPerm;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updatePermission = async (id: string, dto: UpdateUserRoutePermissionDTO): Promise<UserRoutePermission> => {
    try {
      const useCase = new UpdateUserRoutePermissionUseCase(repository);
      const updated = await useCase.execute(id, dto);
      await loadPermissions();
      return updated;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deletePermission = async (id: string): Promise<void> => {
    try {
      const useCase = new DeleteUserRoutePermissionUseCase(repository);
      await useCase.execute(id);
      await loadPermissions();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    permissions,
    loading,
    error,
    createPermission,
    updatePermission,
    deletePermission,
    refresh: loadPermissions,
  };
}
