// ============================================
// src/presentation/features/permissions/hooks/useRoles.ts
// ============================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { SupabasePermissionRepository } from '@/src/infrastructure/repositories/SupabasePermissionRepository';
import { GetAllRolesUseCase } from '@/src/core/application/use-cases/permissions';
import { CreateRoleUseCase } from '@/src/core/application/use-cases/permissions';
import type { CreateRoleDTO } from '@/src/core/application/use-cases/permissions';
import { Role } from '@/src/core/domain/entities/Permission';

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ CORRECCIÓN: No pasar argumentos (el repositorio crea su propio cliente)
  const repository = new SupabasePermissionRepository();

  const loadRoles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const useCase = new GetAllRolesUseCase(repository);
      const data = await useCase.execute();
      
      setRoles(data);
    } catch (err: any) {
      console.error('Error loading roles:', err);
      setError(err.message || 'Error al cargar roles');
    } finally {
      setLoading(false);
    }
  }, []);

  const createRole = useCallback(async (dto: CreateRoleDTO) => {
    try {
      const useCase = new CreateRoleUseCase(repository);
      const newRole = await useCase.execute(dto);
      
      setRoles(prev => [...prev, newRole]);
      return newRole;
    } catch (err: any) {
      throw new Error(err.message || 'Error al crear rol');
    }
  }, []);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  return {
    roles,
    loading,
    error,
    createRole,
    refresh: loadRoles,
  };
}