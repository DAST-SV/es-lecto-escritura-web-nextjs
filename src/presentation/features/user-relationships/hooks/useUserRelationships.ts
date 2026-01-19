// ============================================
// src/presentation/features/user-relationships/hooks/useUserRelationships.ts
// Hook for managing user relationships
// ============================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserRelationshipRepository } from '@/src/infrastructure/repositories/user-relationships/UserRelationshipRepository';
import {
  GetRelationshipsUseCase,
  GetPendingApprovalsUseCase,
  CreateRelationshipUseCase,
  ApproveRelationshipUseCase,
  RemoveRelationshipUseCase,
  CreateUserRelationshipDTO
} from '@/src/core/application/use-cases/user-relationships';
import { UserRelationship } from '@/src/core/domain/entities/UserRelationship';

const repository = new UserRelationshipRepository();

export function useUserRelationships(filters?: {
  parentUserId?: string;
  childUserId?: string;
}) {
  const [relationships, setRelationships] = useState<UserRelationship[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<UserRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRelationships = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const useCase = new GetRelationshipsUseCase(repository);
      const result = await useCase.execute(filters);

      setRelationships(result);
    } catch (err: any) {
      setError(err.message || 'Error loading relationships');
      console.error('Error in useUserRelationships:', err);
    } finally {
      setLoading(false);
    }
  }, [filters?.parentUserId, filters?.childUserId]);

  const fetchPendingApprovals = useCallback(async () => {
    try {
      const useCase = new GetPendingApprovalsUseCase(repository);
      const result = await useCase.execute();
      setPendingApprovals(result);
    } catch (err: any) {
      console.error('Error fetching pending approvals:', err);
    }
  }, []);

  const createRelationship = async (dto: CreateUserRelationshipDTO): Promise<UserRelationship> => {
    try {
      setError(null);
      const useCase = new CreateRelationshipUseCase(repository);
      const result = await useCase.execute(dto);
      await fetchRelationships();
      await fetchPendingApprovals();
      return result;
    } catch (err: any) {
      setError(err.message || 'Error creating relationship');
      throw err;
    }
  };

  const approveRelationship = async (
    relationshipId: string,
    approvingUserId: string
  ): Promise<UserRelationship> => {
    try {
      setError(null);
      const useCase = new ApproveRelationshipUseCase(repository);
      const result = await useCase.execute(relationshipId, approvingUserId);
      await fetchRelationships();
      await fetchPendingApprovals();
      return result;
    } catch (err: any) {
      setError(err.message || 'Error approving relationship');
      throw err;
    }
  };

  const removeRelationship = async (
    relationshipId: string,
    requestingUserId: string
  ): Promise<void> => {
    try {
      setError(null);
      const useCase = new RemoveRelationshipUseCase(repository);
      await useCase.execute(relationshipId, requestingUserId);
      await fetchRelationships();
      await fetchPendingApprovals();
    } catch (err: any) {
      setError(err.message || 'Error removing relationship');
      throw err;
    }
  };

  useEffect(() => {
    fetchRelationships();
    fetchPendingApprovals();
  }, [fetchRelationships, fetchPendingApprovals]);

  return {
    relationships,
    pendingApprovals,
    loading,
    error,
    createRelationship,
    approveRelationship,
    removeRelationship,
    refresh: fetchRelationships,
    refreshPendingApprovals: fetchPendingApprovals,
  };
}
