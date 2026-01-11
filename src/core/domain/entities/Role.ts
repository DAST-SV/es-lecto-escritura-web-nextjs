// ============================================
// src/core/domain/entities/Role.ts
// Entidad: Rol del sistema
// ============================================

export class Role {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly displayName: string,
    public readonly description: string | null,
    public readonly hierarchyLevel: number,
    public readonly isSystemRole: boolean,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: Date | null,
    public readonly permissions?: string[] // IDs de permisos asignados
  ) {}

  /**
   * Factory: Crear desde base de datos
   */
  static fromDatabase(data: any): Role {
    return new Role(
      data.id,
      data.name,
      data.display_name,
      data.description,
      data.hierarchy_level,
      data.is_system_role ?? false,
      data.is_active ?? true,
      new Date(data.created_at),
      new Date(data.updated_at),
      data.deleted_at ? new Date(data.deleted_at) : null,
      data.permissions
    );
  }

  /**
   * Verificar si está eliminado
   */
  isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  /**
   * Verificar si puede ser eliminado
   */
  canBeDeleted(): boolean {
    return !this.isSystemRole;
  }

  /**
   * Verificar si puede ser modificado
   */
  canBeModified(): boolean {
    return !this.isSystemRole;
  }
}