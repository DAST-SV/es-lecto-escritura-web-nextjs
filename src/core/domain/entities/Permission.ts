// ============================================
// src/core/domain/entities/Permission.ts
// ============================================

export interface PermissionData {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  resource: string;
  action: string;
  isSystemPermission: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export class Permission {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly displayName: string,
    public readonly description: string | undefined,
    public readonly resource: string,
    public readonly action: string,
    public readonly isSystemPermission: boolean,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: Date | undefined
  ) {}

  static fromDatabase(data: any): Permission {
    return new Permission(
      data.id,
      data.name,
      data.display_name,
      data.description,
      data.resource,
      data.action,
      data.is_system_permission ?? false,
      data.is_active ?? true,
      new Date(data.created_at),
      new Date(data.updated_at),
      data.deleted_at ? new Date(data.deleted_at) : undefined
    );
  }

  toDatabase() {
    return {
      id: this.id,
      name: this.name,
      display_name: this.displayName,
      description: this.description,
      resource: this.resource,
      action: this.action,
      is_system_permission: this.isSystemPermission,
      is_active: this.isActive,
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString(),
      deleted_at: this.deletedAt?.toISOString(),
    };
  }
}