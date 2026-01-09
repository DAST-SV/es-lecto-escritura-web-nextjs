// ============================================
// 2. src/core/domain/repositories/IUserTypeRepository.ts
// ============================================

import { UserType } from '../entities/UserType';

export interface IUserTypeRepository {
  findAll(): Promise<UserType[]>;
  findById(id: number): Promise<UserType | null>;
  create(data: { nombre: string; descripcion: string | null }): Promise<UserType>;
  update(id: number, data: { nombre: string; descripcion: string | null }): Promise<UserType>;
  delete(id: number): Promise<void>;
  existsByName(nombre: string, excludeId?: number): Promise<boolean>;
}