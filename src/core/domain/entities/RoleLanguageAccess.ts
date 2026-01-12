// ============================================
// src/core/domain/entities/RoleLanguageAccess.ts
// Entidad: Idiomas permitidos por rol
// ============================================

export class RoleLanguageAccess {
  constructor(
    public readonly id: string,
    public readonly roleId: string,
    public readonly languageCode: string,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static fromDatabase(data: any): RoleLanguageAccess {
    return new RoleLanguageAccess(
      data.id,
      data.role_id,
      data.language_code,
      data.is_active ?? true,
      new Date(data.created_at),
      new Date(data.updated_at)
    );
  }

  toDatabase() {
    return {
      id: this.id,
      role_id: this.roleId,
      language_code: this.languageCode,
      is_active: this.isActive,
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString(),
    };
  }
}