// ============================================
// src/core/domain/repositories/IUserTypeRepository.ts
// ✅ CON RESTORE Y HARD DELETE
// ============================================

import { UserType } from '../entities/UserType';

export interface IUserTypeRepository {
  findAll(): Promise<UserType[]>;
  findById(id: number): Promise<UserType | null>;
  create(data: { name: string; description: string | null }): Promise<UserType>;
  update(id: number, data: { name: string; description: string | null }): Promise<UserType>;
  delete(id: number): Promise<void>; // Soft delete
  restore(id: number): Promise<UserType>; // Restaurar
  hardDelete(id: number): Promise<void>; // Eliminación permanente
  existsByName(name: string, excludeId?: number): Promise<boolean>;
}