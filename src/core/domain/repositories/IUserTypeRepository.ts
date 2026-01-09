// ============================================
// src/core/domain/repositories/IUserTypeRepository.ts
// ✅ CORREGIDO: Cambiar 'nombre' por 'name'
// ============================================

import { UserType } from '../entities/UserType';

export interface IUserTypeRepository {
  findAll(): Promise<UserType[]>;
  findById(id: number): Promise<UserType | null>;
  create(data: { name: string; description: string | null }): Promise<UserType>;
  update(id: number, data: { name: string; description: string | null }): Promise<UserType>;
  delete(id: number): Promise<void>;
  existsByName(name: string, excludeId?: number): Promise<boolean>;
}