// ============================================
// src/core/domain/entities/Role.ts
// Domain Entity: Role
// ============================================

export class Role {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly displayName: string,
    public readonly description: string | null,
    public readonly hierarchyLevel: number,
    public readonly isActive: boolean,
    public readonly isSystemRole: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly createdBy: string | null
  ) {}

  /**
   * Creates a Role instance from database row
   */
  static fromDatabase(data: any): Role {
    return new Role(
      data.id,
      data.name,
      data.display_name,
      data.description,
      data.hierarchy_level || 0,
      data.is_active ?? true,
      data.is_system_role ?? false,
      new Date(data.created_at),
      new Date(data.updated_at),
      data.created_by
    );
  }

  /**
   * Checks if the role is active
   */
  isRoleActive(): boolean {
    return this.isActive;
  }

  /**
   * Checks if the role is a system role (cannot be deleted)
   */
  isSystem(): boolean {
    return this.isSystemRole;
  }

  /**
   * Checks if this role has higher hierarchy than another role
   */
  hasHigherHierarchyThan(other: Role): boolean {
    return this.hierarchyLevel > other.hierarchyLevel;
  }

  /**
   * Checks if this role can manage another role (based on hierarchy)
   */
  canManage(other: Role): boolean {
    return this.hierarchyLevel > other.hierarchyLevel;
  }

  /**
   * Gets a display-friendly name
   */
  getDisplayName(): string {
    return this.displayName;
  }

  /**
   * Checks if role can be deleted (not a system role and is active)
   */
  canBeDeleted(): boolean {
    return !this.isSystemRole;
  }

  /**
   * Converts to plain object for serialization
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      displayName: this.displayName,
      description: this.description,
      hierarchyLevel: this.hierarchyLevel,
      isActive: this.isActive,
      isSystemRole: this.isSystemRole,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      createdBy: this.createdBy,
    };
  }
}
