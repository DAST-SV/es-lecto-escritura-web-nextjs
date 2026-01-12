// ============================================
// src/core/domain/entities/PermissionBox.ts
// ============================================

export type PermissionBoxType = 'language' | 'role' | 'custom';

export class PermissionBox {
  constructor(
    public readonly id: string,
    public readonly boxName: string,
    public readonly displayName: string,
    public readonly description: string | undefined,
    public readonly boxType: PermissionBoxType,
    public readonly config: Record<string, any>,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static fromDatabase(data: any): PermissionBox {
    return new PermissionBox(
      data.id,
      data.box_name,
      data.display_name,
      data.description,
      data.box_type,
      data.config || {},
      data.is_active ?? true,
      new Date(data.created_at),
      new Date(data.updated_at)
    );
  }

  toDatabase() {
    return {
      id: this.id,
      box_name: this.boxName,
      display_name: this.displayName,
      description: this.description,
      box_type: this.boxType,
      config: this.config,
      is_active: this.isActive,
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString(),
    };
  }
}