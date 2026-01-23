// ============================================
// src/presentation/features/organizations/hooks/useOrganizationMembers.ts
// ============================================

import { useState, useEffect } from 'react';
import { SupabaseOrganizationRepository } from '@/src/infrastructure/repositories/organizations/OrganizationRepository';
import { OrganizationMember } from '@/src/core/domain/entities/Organization';

const repository = new SupabaseOrganizationRepository();

export function useOrganizationMembers(organizationId: string) {
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await repository.findMembersByOrganization(organizationId);
      setMembers(result);
    } catch (err: any) {
      setError(err.message || 'Error al cargar miembros');
      console.error('Error en useOrganizationMembers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organizationId) {
      fetchMembers();
    }
  }, [organizationId]);

  return {
    members,
    loading,
    error,
    refresh: fetchMembers,
  };
}