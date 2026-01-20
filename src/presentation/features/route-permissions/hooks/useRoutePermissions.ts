// ============================================
// src/presentation/features/route-permissions/hooks/useRoutePermissions.ts
// Hook: RoutePermission Management
// ============================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { RoutePermission } from '@/src/core/domain/entities/RoutePermission';
import { RoutePermissionRepository } from '@/src/infrastructure/repositories/route-permissions/RoutePermissionRepository';
import {
  GetAllRoutePermissionsUseCase,
  GetRoutePermissionByIdUseCase,
  GetRoutePermissionsByRoleUseCase,
  CreateRoutePermissionUseCase,
  UpdateRoutePermissionUseCase,
  DeleteRoutePermissionUseCase,
} from '@/src/core/application/use-cases/route-permissions';
import { CreateRoutePermissionDTO, UpdateRoutePermissionDTO } from '@/src/core/domain/repositories/IRoutePermissionRepository';

export function useRoutePermissions(includeInactive: boolean = false) {
  const [permissions, setPermissions] = useState<RoutePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const repository = new RoutePermissionRepository();

  const loadPermissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const useCase = new GetAllRoutePermissionsUseCase(repository);
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

  const createPermission = async (dto: CreateRoutePermissionDTO): Promise<RoutePermission> => {
    try {
      const useCase = new CreateRoutePermissionUseCase(repository);
      const newPerm = await useCase.execute(dto);
      await loadPermissions();
      return newPerm;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updatePermission = async (id: string, dto: UpdateRoutePermissionDTO): Promise<RoutePermission> => {
    try {
      const useCase = new UpdateRoutePermissionUseCase(repository);
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
      const useCase = new DeleteRoutePermissionUseCase(repository);
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
