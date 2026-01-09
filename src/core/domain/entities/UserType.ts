// src/core/domain/entities/UserType.ts

/**
 * CAPA DE DOMINIO - ENTIDAD
 * Representa un tipo de usuario en el sistema
 * NO conoce frameworks ni bases de datos
 */

export class UserType {
  constructor(
    public readonly id: number,
    public readonly nombre: string,
    public readonly descripcion: string | null,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {
    this.validate();
  }

  /**
   * Validación de reglas de negocio
   */
  private validate(): void {
    if (!this.nombre || this.nombre.trim().length === 0) {
      throw new Error('El nombre del tipo de usuario es requerido');
    }

    if (this.nombre.trim().length < 3) {
      throw new Error('El nombre debe tener al menos 3 caracteres');
    }

    if (this.nombre.trim().length > 50) {
      throw new Error('El nombre no puede exceder 50 caracteres');
    }

    if (this.descripcion && this.descripcion.trim().length > 200) {
      throw new Error('La descripción no puede exceder 200 caracteres');
    }
  }

  /**
   * Crea una nueva instancia con datos actualizados
   */
  public update(data: Partial<Pick<UserType, 'nombre' | 'descripcion'>>): UserType {
    return new UserType(
      this.id,
      data.nombre ?? this.nombre,
      data.descripcion ?? this.descripcion,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Convierte a objeto plano para serialización
   */
  public toPlainObject() {
    return {
      id_tipo_usuario: this.id,
      nombre: this.nombre,
      descripcion: this.descripcion,
      created_at: this.createdAt,
      updated_at: this.updatedAt
    };
  }

  /**
   * Crea una instancia desde datos de base de datos
   */
  public static fromDatabase(data: any): UserType {
    return new UserType(
      data.id_tipo_usuario,
      data.nombre,
      data.descripcion,
      data.created_at ? new Date(data.created_at) : undefined,
      data.updated_at ? new Date(data.updated_at) : undefined
    );
  }

  /**
   * Crea una nueva instancia (sin ID)
   */
  public static create(
    nombre: string,
    descripcion: string | null = null
  ): Omit<UserType, 'id' | 'createdAt' | 'updatedAt'> {
    const userType = new UserType(0, nombre, descripcion);
    return {
      nombre: userType.nombre,
      descripcion: userType.descripcion,
      validate: () => userType.validate(),
      toPlainObject: () => ({
        nombre: userType.nombre,
        descripcion: userType.descripcion
      })
    } as any;
  }
}