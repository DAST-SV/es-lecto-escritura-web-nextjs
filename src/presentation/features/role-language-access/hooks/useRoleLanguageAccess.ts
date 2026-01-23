// ============================================
// src/presentation/features/role-language-access/hooks/useRoleLanguageAccess.ts
// Custom Hook: Role Language Access Management
// ============================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { RoleLanguageAccess, LanguageCode } from '@/src/core/domain/entities/RoleLanguageAccess';
import { RoleLanguageAccessRepository } from '@/src/infrastructure/repositories/role-language-access/RoleLanguageAccessRepository';
import { CreateRoleLanguageAccessDTO } from '@/src/core/domain/repositories/IRoleLanguageAccessRepository';
import {
  GetAllRoleLanguageAccess,
  GetRoleLanguageAccessById,
  GetRoleLanguageAccessByRole,
  CreateRoleLanguageAccess,
  DeleteRoleLanguageAccess,
  GrantLanguagesToRole,
  ActivateRoleLanguageAccess,
  DeactivateRoleLanguageAccess,
} from '@/src/core/application/use-cases/role-language-access';

export function useRoleLanguageAccess() {
  const [accesses, setAccesses] = useState<RoleLanguageAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const repository = new RoleLanguageAccessRepository();

  const fetchAll = useCallback(async (includeInactive = false) => {
    try {
      setLoading(true);
      setError(null);
      const useCase = new GetAllRoleLanguageAccess(repository);
      const data = await useCase.execute(includeInactive);
      setAccesses(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch role language access');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchById = useCallback(async (id: string) => {
    try {
      const useCase = new GetRoleLanguageAccessById(repository);
      return await useCase.execute(id);
    } catch (err: any) {
      throw new Error(err.message || 'Failed to fetch role language access');
    }
  }, []);

  const fetchByRole = useCallback(async (roleName: string) => {
    try {
      const useCase = new GetRoleLanguageAccessByRole(repository);
      return await useCase.execute(roleName);
    } catch (err: any) {
      throw new Error(err.message || 'Failed to fetch role language access');
    }
  }, []);

  const createAccess = useCallback(async (dto: CreateRoleLanguageAccessDTO) => {
    try {
      const useCase = new CreateRoleLanguageAccess(repository);
      const newAccess = await useCase.execute(dto);
      setAccesses((prev) => [...prev, newAccess]);
      return newAccess;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to create role language access');
    }
  }, []);

  const deleteAccess = useCallback(async (id: string) => {
    try {
      const useCase = new DeleteRoleLanguageAccess(repository);
      await useCase.execute(id);
      setAccesses((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      throw new Error(err.message || 'Failed to delete role language access');
    }
  }, []);

  const grantLanguages = useCallback(async (roleName: string, languageCodes: LanguageCode[], createdBy: string) => {
    try {
      const useCase = new GrantLanguagesToRole(repository);
      const newAccesses = await useCase.execute(roleName, languageCodes, createdBy);
      setAccesses((prev) => [...prev, ...newAccesses]);
      return newAccesses;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to grant languages');
    }
  }, []);

  const activateAccess = useCallback(async (id: string) => {
    try {
      const useCase = new ActivateRoleLanguageAccess(repository);
      await useCase.execute(id);
      await fetchAll();
    } catch (err: any) {
      throw new Error(err.message || 'Failed to activate role language access');
    }
  }, [fetchAll]);

  const deactivateAccess = useCallback(async (id: string) => {
    try {
      const useCase = new DeactivateRoleLanguageAccess(repository);
      await useCase.execute(id);
      await fetchAll();
    } catch (err: any) {
      throw new Error(err.message || 'Failed to deactivate role language access');
    }
  }, [fetchAll]);

  const refresh = useCallback(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    accesses,
    loading,
    error,
    fetchById,
    fetchByRole,
    createAccess,
    deleteAccess,
    grantLanguages,
    activateAccess,
    deactivateAccess,
    refresh,
  };
}
