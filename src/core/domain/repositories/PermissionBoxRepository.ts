// ============================================
// src/core/domain/repositories/PermissionBoxRepository.ts
// ============================================

import { PermissionBox, PermissionBoxType } from '../entities/PermissionBox';

export interface CreatePermissionBoxDTO {
  boxName: string;
  displayName: string;
  description?: string;
  boxType: PermissionBoxType;
  config: Record<string, any>;
}

export interface UpdatePermissionBoxDTO {
  displayName?: string;
  description?: string;
  config?: Record<string, any>;
  isActive?: boolean;
}

export interface PermissionBoxRepository {
  findAll(): Promise<PermissionBox[]>;
  findById(id: string): Promise<PermissionBox | null>;
  findByName(boxName: string): Promise<PermissionBox | null>;
  findByType(boxType: PermissionBoxType): Promise<PermissionBox[]>;
  create(dto: CreatePermissionBoxDTO): Promise<PermissionBox>;
  update(id: string, dto: UpdatePermissionBoxDTO): Promise<PermissionBox>;
  delete(id: string): Promise<void>;
}