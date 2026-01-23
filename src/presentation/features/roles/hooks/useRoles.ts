// ============================================
// src/presentation/features/roles/hooks/useRoles.ts
// Hook: Role Management
// ============================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Role } from '@/src/core/domain/entities/Role';
import { RoleRepository } from '@/src/infrastructure/repositories/roles/RoleRepository';
import {
  GetAllRolesUseCase,
  GetRoleByIdUseCase,
  GetRoleByNameUseCase,
  GetSystemRolesUseCase,
  CreateRoleUseCase,
  UpdateRoleUseCase,
  DeleteRoleUseCase,
  DeactivateRoleUseCase,
  ActivateRoleUseCase,
} from '@/src/core/application/use-cases/roles';
import { CreateRoleDTO, UpdateRoleDTO } from '@/src/core/domain/repositories/IRoleRepository';

export function useRoles(includeInactive: boolean = false) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize repository
  const repository = new RoleRepository();

  // Load roles
  const loadRoles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const useCase = new GetAllRolesUseCase(repository);
      const data = await useCase.execute(includeInactive);
      setRoles(data);
    } catch (err: any) {
      setError(err.message || 'Error loading roles');
      console.error('Error loading roles:', err);
    } finally {
      setLoading(false);
    }
  }, [includeInactive]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  // Get role by ID
  const getRoleById = async (id: string): Promise<Role | null> => {
    try {
      const useCase = new GetRoleByIdUseCase(repository);
      return await useCase.execute(id);
    } catch (err: any) {
      console.error('Error getting role by ID:', err);
      return null;
    }
  };

  // Get role by name
  const getRoleByName = async (name: string): Promise<Role | null> => {
    try {
      const useCase = new GetRoleByNameUseCase(repository);
      return await useCase.execute(name);
    } catch (err: any) {
      console.error('Error getting role by name:', err);
      return null;
    }
  };

  // Get system roles
  const getSystemRoles = async (): Promise<Role[]> => {
    try {
      const useCase = new GetSystemRolesUseCase(repository);
      return await useCase.execute();
    } catch (err: any) {
      console.error('Error getting system roles:', err);
      return [];
    }
  };

  // Create role
  const createRole = async (dto: CreateRoleDTO): Promise<Role> => {
    try {
      const useCase = new CreateRoleUseCase(repository);
      const newRole = await useCase.execute(dto);
      await loadRoles(); // Reload list
      return newRole;
    } catch (err: any) {
      const errorMessage = err.message || 'Error creating role';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Update role
  const updateRole = async (id: string, dto: UpdateRoleDTO, updatedBy: string): Promise<Role> => {
    try {
      const useCase = new UpdateRoleUseCase(repository);
      const updatedRole = await useCase.execute(id, dto, updatedBy);
      await loadRoles(); // Reload list
      return updatedRole;
    } catch (err: any) {
      const errorMessage = err.message || 'Error updating role';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Delete role
  const deleteRole = async (id: string): Promise<void> => {
    try {
      const useCase = new DeleteRoleUseCase(repository);
      await useCase.execute(id);
      await loadRoles(); // Reload list
    } catch (err: any) {
      const errorMessage = err.message || 'Error deleting role';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Deactivate role
  const deactivateRole = async (id: string): Promise<void> => {
    try {
      const useCase = new DeactivateRoleUseCase(repository);
      await useCase.execute(id);
      await loadRoles(); // Reload list
    } catch (err: any) {
      const errorMessage = err.message || 'Error deactivating role';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Activate role
  const activateRole = async (id: string): Promise<void> => {
    try {
      const useCase = new ActivateRoleUseCase(repository);
      await useCase.execute(id);
      await loadRoles(); // Reload list
    } catch (err: any) {
      const errorMessage = err.message || 'Error activating role';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Refresh
  const refresh = () => {
    loadRoles();
  };

  return {
    roles,
    loading,
    error,
    getRoleById,
    getRoleByName,
    getSystemRoles,
    createRole,
    updateRole,
    deleteRole,
    deactivateRole,
    activateRole,
    refresh,
  };
}
