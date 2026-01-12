// ============================================
// src/core/domain/entities/Role.ts
// ============================================

export interface RoleData {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  hierarchyLevel: number;
  isSystemRole: boolean;
  isActive: boolean;
  permissionsCount?: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export class Role {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly displayName: string,
    public readonly description: string | undefined,
    public readonly hierarchyLevel: number,
    public readonly isSystemRole: boolean,
    public readonly isActive: boolean,
    public readonly permissionsCount: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: Date | undefined
  ) {}

  static fromDatabase(data: any): Role {
    return new Role(
      data.id,
      data.name,
      data.display_name,
      data.description,
      data.hierarchy_level ?? 0,
      data.is_system_role ?? false,
      data.is_active ?? true,
      data.permissions_count ?? 0,
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
      hierarchy_level: this.hierarchyLevel,
      is_system_role: this.isSystemRole,
      is_active: this.isActive,
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString(),
      deleted_at: this.deletedAt?.toISOString(),
    };
  }
}