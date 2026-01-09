// ============================================
// src/presentation/features/organizations/hooks/useOrganizations.ts
// ============================================

import { useState, useEffect } from 'react';
import { SupabaseOrganizationRepository } from '@/src/infrastructure/repositories/organizations/OrganizationRepository';
import {
  GetAllOrganizationsUseCase,
  GetUserOrganizationsUseCase,
  CreateOrganizationUseCase,
  UpdateOrganizationUseCase,
  DeleteOrganizationUseCase,
  AddMemberUseCase,
  RemoveMemberUseCase,
  UpdateMemberRoleUseCase,
} from '@/src/core/application/use-cases/organizations';
import { Organization, OrganizationType, UserRole } from '@/src/core/domain/entities/Organization';
import type { CreateOrganizationDTO, UpdateOrganizationDTO } from '@/src/core/application/use-cases/organizations/CreateOrganization.usecase';

const repository = new SupabaseOrganizationRepository();

export function useOrganizations(userId?: string) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let result: Organization[];
      
      if (userId) {
        // Obtener organizaciones del usuario
        const useCase = new GetUserOrganizationsUseCase(repository);
        result = await useCase.execute(userId);
      } else {
        // Obtener todas las organizaciones
        const useCase = new GetAllOrganizationsUseCase(repository);
        result = await useCase.execute();
      }
      
      setOrganizations(result);
    } catch (err: any) {
      setError(err.message || 'Error al cargar organizaciones');
      console.error('Error en useOrganizations:', err);
    } finally {
      setLoading(false);
    }
  };

  const createOrganization = async (
    createdBy: string,
    data: CreateOrganizationDTO
  ): Promise<Organization> => {
    const useCase = new CreateOrganizationUseCase(repository);
    const result = await useCase.execute(createdBy, data);
    await fetchOrganizations();
    return result;
  };

  const updateOrganization = async (
    id: string,
    userId: string,
    data: UpdateOrganizationDTO
  ): Promise<Organization> => {
    const useCase = new UpdateOrganizationUseCase(repository);
    const result = await useCase.execute(id, userId, data);
    await fetchOrganizations();
    return result;
  };

  const deleteOrganization = async (
    id: string,
    userId: string,
    hardDelete: boolean = false
  ): Promise<void> => {
    const useCase = new DeleteOrganizationUseCase(repository);
    await useCase.execute(id, userId, hardDelete);
    await fetchOrganizations();
  };

  const addMember = async (
    organizationId: string,
    userId: string,
    role: UserRole,
    invitedBy: string
  ) => {
    const useCase = new AddMemberUseCase(repository);
    return await useCase.execute(organizationId, userId, role, invitedBy);
  };

  const removeMember = async (
    organizationId: string,
    userIdToRemove: string,
    requestingUserId: string
  ) => {
    const useCase = new RemoveMemberUseCase(repository);
    await useCase.execute(organizationId, userIdToRemove, requestingUserId);
  };

  const updateMemberRole = async (
    organizationId: string,
    userId: string,
    newRole: UserRole,
    requestingUserId: string
  ) => {
    const useCase = new UpdateMemberRoleUseCase(repository);
    return await useCase.execute(organizationId, userId, newRole, requestingUserId);
  };

  useEffect(() => {
    fetchOrganizations();
  }, [userId]);

  return {
    organizations,
    loading,
    error,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    addMember,
    removeMember,
    updateMemberRole,
    refresh: fetchOrganizations,
  };
}