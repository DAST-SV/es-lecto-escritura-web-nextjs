// ============================================
// src/core/domain/entities/Permission.ts
// Entidad: Permiso del sistema
// ============================================

export class Permission {
  constructor(
    public readonly id: string,
    public readonly name: string, // 'books.read', 'users.create'
    public readonly displayName: string,
    public readonly description: string | null,
    public readonly resource: string, // 'books', 'users'
    public readonly action: string, // 'read', 'create', 'update', 'delete'
    public readonly isSystemPermission: boolean,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: Date | null
  ) {}

  /**
   * Factory: Crear desde base de datos
   */
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
      data.deleted_at ? new Date(data.deleted_at) : null
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
    return !this.isSystemPermission;
  }

  /**
   * Verificar si es permiso CRUD básico
   */
  isCRUDPermission(): boolean {
    const crudActions = ['create', 'read', 'update', 'delete', 'list'];
    return crudActions.includes(this.action);
  }
}