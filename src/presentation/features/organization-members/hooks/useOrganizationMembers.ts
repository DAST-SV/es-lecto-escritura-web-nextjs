// ============================================
// src/presentation/features/organization-members/hooks/useOrganizationMembers.ts
// Hook for managing organization members
// ============================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { OrganizationMemberRepository } from '@/src/infrastructure/repositories/organization-members/OrganizationMemberRepository';
import {
  GetOrganizationMembersUseCase,
  GetMembersByUserUseCase,
  AddOrganizationMemberUseCase,
  UpdateMemberRoleUseCase,
  RemoveOrganizationMemberUseCase,
  CreateOrganizationMemberDTO
} from '@/src/core/application/use-cases/organization-members';
import { OrganizationMember, OrganizationMemberRole } from '@/src/core/domain/entities/OrganizationMember';

const repository = new OrganizationMemberRepository();

export function useOrganizationMembers(organizationId?: string, userId?: string) {
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let result: OrganizationMember[];

      if (organizationId) {
        // Get members of a specific organization
        const useCase = new GetOrganizationMembersUseCase(repository);
        result = await useCase.execute(organizationId);
      } else if (userId) {
        // Get all organizations a user is a member of
        const useCase = new GetMembersByUserUseCase(repository);
        result = await useCase.execute(userId);
      } else {
        result = [];
      }

      setMembers(result);
    } catch (err: any) {
      setError(err.message || 'Error loading members');
      console.error('Error in useOrganizationMembers:', err);
    } finally {
      setLoading(false);
    }
  }, [organizationId, userId]);

  const addMember = async (dto: CreateOrganizationMemberDTO): Promise<OrganizationMember> => {
    try {
      setError(null);
      const useCase = new AddOrganizationMemberUseCase(repository);
      const result = await useCase.execute(dto);
      await fetchMembers();
      return result;
    } catch (err: any) {
      setError(err.message || 'Error adding member');
      throw err;
    }
  };

  const updateMemberRole = async (
    memberId: string,
    newRole: OrganizationMemberRole,
    requestingUserId: string
  ): Promise<OrganizationMember> => {
    try {
      setError(null);
      const useCase = new UpdateMemberRoleUseCase(repository);
      const result = await useCase.execute(memberId, newRole, requestingUserId);
      await fetchMembers();
      return result;
    } catch (err: any) {
      setError(err.message || 'Error updating member role');
      throw err;
    }
  };

  const removeMember = async (
    memberId: string,
    requestingUserId: string
  ): Promise<void> => {
    try {
      setError(null);
      const useCase = new RemoveOrganizationMemberUseCase(repository);
      await useCase.execute(memberId, requestingUserId);
      await fetchMembers();
    } catch (err: any) {
      setError(err.message || 'Error removing member');
      throw err;
    }
  };

  useEffect(() => {
    if (organizationId || userId) {
      fetchMembers();
    } else {
      setLoading(false);
    }
  }, [fetchMembers, organizationId, userId]);

  return {
    members,
    loading,
    error,
    addMember,
    updateMemberRole,
    removeMember,
    refresh: fetchMembers,
  };
}
