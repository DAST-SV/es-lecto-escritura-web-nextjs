// ============================================
// src/core/domain/entities/UserType.ts
// ✅ CORREGIDO: Sincronizado con 01_app.sql (tabla user_types)
// ============================================

export class UserType {
  constructor(
    public readonly id: number,
    public readonly name: string, // ✅ Cambiado de 'nombre' a 'name'
    public readonly description: string | null,
    public readonly isActive: boolean, // ✅ Agregado
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error('El nombre del tipo de usuario es requerido');
    }

    if (this.name.trim().length < 3) {
      throw new Error('El nombre debe tener al menos 3 caracteres');
    }

    if (this.name.trim().length > 50) {
      throw new Error('El nombre no puede exceder 50 caracteres');
    }

    if (this.description && this.description.trim().length > 500) {
      throw new Error('La descripción no puede exceder 500 caracteres');
    }
  }

  public update(data: Partial<Pick<UserType, 'name' | 'description'>>): UserType {
    return new UserType(
      this.id,
      data.name ?? this.name,
      data.description ?? this.description,
      this.isActive,
      this.createdAt,
      new Date()
    );
  }

  public toPlainObject() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      is_active: this.isActive,
      created_at: this.createdAt,
      updated_at: this.updatedAt
    };
  }

  public static fromDatabase(data: any): UserType {
    return new UserType(
      data.id,
      data.name,
      data.description,
      data.is_active ?? true,
      data.created_at ? new Date(data.created_at) : undefined,
      data.updated_at ? new Date(data.updated_at) : undefined
    );
  }

  public static create(name: string, description: string | null = null): UserType {
    return new UserType(0, name, description, true);
  }
}