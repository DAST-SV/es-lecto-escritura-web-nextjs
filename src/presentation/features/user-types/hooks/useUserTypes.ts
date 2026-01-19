// ============================================
// src/presentation/features/user-types/hooks/useUserTypes.ts
// ✅ CON RESTORE
// ============================================

import { useState, useEffect } from 'react';
import { SupabaseUserTypeRepository } from '@/src/infrastructure/repositories/user-types/UserTypeRepository';
import {
  GetAllUserTypesUseCase,
  CreateUserTypeUseCase,
  UpdateUserTypeUseCase,
  DeleteUserTypeUseCase,
} from '@/src/core/application/use-cases/user-types';
import { RestoreUserTypeUseCase } from '@/src/core/application/use-cases/user-types/RestoreUserType.usecase';
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
      console.log('✅ Tipos de usuario cargados:', result);
    } catch (err: any) {
      console.error('❌ Error al cargar tipos de usuario:', err);
      setError(err.message || 'Error al cargar tipos de usuario');
    } finally {
      setLoading(false);
    }
  };

  const createUserType = async (data: { name: string; description: string | null }) => {
    try {
      console.log('📝 Creando tipo de usuario:', data);
      const useCase = new CreateUserTypeUseCase(repository);
      await useCase.execute(data);
      await fetchUserTypes();
      console.log('✅ Tipo de usuario creado exitosamente');
    } catch (err: any) {
      console.error('❌ Error al crear tipo de usuario:', err);
      throw err;
    }
  };

  const updateUserType = async (
    id: number,
    data: { name: string; description: string | null }
  ) => {
    try {
      console.log('📝 Actualizando tipo de usuario:', id, data);
      const useCase = new UpdateUserTypeUseCase(repository);
      await useCase.execute(id, data);
      await fetchUserTypes();
      console.log('✅ Tipo de usuario actualizado exitosamente');
    } catch (err: any) {
      console.error('❌ Error al actualizar tipo de usuario:', err);
      throw err;
    }
  };

  const deleteUserType = async (id: number) => {
    try {
      console.log('🗑️ Eliminando tipo de usuario (soft delete):', id);
      const useCase = new DeleteUserTypeUseCase(repository);
      await useCase.execute(id);
      await fetchUserTypes();
      console.log('✅ Tipo de usuario eliminado (soft delete)');
    } catch (err: any) {
      console.error('❌ Error al eliminar tipo de usuario:', err);
      throw err;
    }
  };

  const restoreUserType = async (id: number) => {
    try {
      console.log('♻️ Restaurando tipo de usuario:', id);
      const useCase = new RestoreUserTypeUseCase(repository);
      await useCase.execute(id);
      await fetchUserTypes();
      console.log('✅ Tipo de usuario restaurado exitosamente');
    } catch (err: any) {
      console.error('❌ Error al restaurar tipo de usuario:', err);
      throw err;
    }
  };

  const hardDeleteUserType = async (id: number) => {
    try {
      console.log('🗑️ Eliminando tipo de usuario PERMANENTEMENTE:', id);
      await repository.hardDelete(id);
      await fetchUserTypes();
      console.log('✅ Tipo de usuario eliminado permanentemente');
    } catch (err: any) {
      console.error('❌ Error al eliminar permanentemente:', err);
      throw err;
    }
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
    restoreUserType,
    hardDeleteUserType,
    refresh: fetchUserTypes,
  };
}