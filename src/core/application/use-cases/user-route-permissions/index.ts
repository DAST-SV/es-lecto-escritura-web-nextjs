// ============================================
// src/core/application/use-cases/user-route-permissions/index.ts
// Use Cases: UserRoutePermission Management
// ============================================

import { IUserRoutePermissionRepository, CreateUserRoutePermissionDTO, UpdateUserRoutePermissionDTO } from '@/src/core/domain/repositories/IUserRoutePermissionRepository';
import { UserRoutePermission } from '@/src/core/domain/entities/UserRoutePermission';

export class GetAllUserRoutePermissionsUseCase {
  constructor(private repository: IUserRoutePermissionRepository) {}
  async execute(includeInactive: boolean = false): Promise<UserRoutePermission[]> {
    return this.repository.findAll(includeInactive);
  }
}

export class GetUserRoutePermissionByIdUseCase {
  constructor(private repository: IUserRoutePermissionRepository) {}
  async execute(id: string): Promise<UserRoutePermission | null> {
    return this.repository.findById(id);
  }
}

export class GetUserRoutePermissionsByUserUseCase {
  constructor(private repository: IUserRoutePermissionRepository) {}
  async execute(userId: string): Promise<UserRoutePermission[]> {
    return this.repository.findByUserId(userId);
  }
}

export class CreateUserRoutePermissionUseCase {
  constructor(private repository: IUserRoutePermissionRepository) {}
  async execute(dto: CreateUserRoutePermissionDTO): Promise<UserRoutePermission> {
    const existing = await this.repository.findByUserAndRoute(dto.userId, dto.routeId, dto.languageCode);
    if (existing && existing.isActive) {
      throw new Error('This permission already exists');
    }
    return this.repository.create(dto);
  }
}

export class UpdateUserRoutePermissionUseCase {
  constructor(private repository: IUserRoutePermissionRepository) {}
  async execute(id: string, dto: UpdateUserRoutePermissionDTO): Promise<UserRoutePermission> {
    return this.repository.update(id, dto);
  }
}

export class DeleteUserRoutePermissionUseCase {
  constructor(private repository: IUserRoutePermissionRepository) {}
  async execute(id: string): Promise<void> {
    return this.repository.delete(id);
  }
}
