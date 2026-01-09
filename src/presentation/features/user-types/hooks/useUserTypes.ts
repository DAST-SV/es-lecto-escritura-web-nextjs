// ============================================
// 11. src/presentation/features/user-types/hooks/useUserTypes.ts
// ============================================

import { useState, useEffect } from 'react';
import { SupabaseUserTypeRepository } from '@/src/infrastructure/repositories/user-types/UserTypeRepository';
import {
  GetAllUserTypesUseCase,
  CreateUserTypeUseCase,
  UpdateUserTypeUseCase,
  DeleteUserTypeUseCase,
} from '@/src/core/application/use-cases/user-types';
import { UserType } from '@/src/core/domain/entities/UserType';

const repository = new SupabaseUserTypeRepository();

export function useUserTypes() {
  const [userTypes, setUserTypes] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const useCase = new GetAllUserTypesUseCase(repository);
      const result = await useCase.execute();
      setUserTypes(result);
    } catch (err: any) {
      setError(err.message || 'Error al cargar tipos de usuario');
    } finally {
      setLoading(false);
    }
  };

  const createUserType = async (data: { nombre: string; descripcion: string | null }) => {
    const useCase = new CreateUserTypeUseCase(repository);
    await useCase.execute(data);
    await fetchUserTypes();
  };

  const updateUserType = async (
    id: number,
    data: { nombre: string; descripcion: string | null }
  ) => {
    const useCase = new UpdateUserTypeUseCase(repository);
    await useCase.execute(id, data);
    await fetchUserTypes();
  };

  const deleteUserType = async (id: number) => {
    const useCase = new DeleteUserTypeUseCase(repository);
    await useCase.execute(id);
    await fetchUserTypes();
  };

  useEffect(() => {
    fetchUserTypes();
  }, []);

  return {
    userTypes,
    loading,
    error,
    createUserType,
    updateUserType,
    deleteUserType,
    refresh: fetchUserTypes,
  };
}