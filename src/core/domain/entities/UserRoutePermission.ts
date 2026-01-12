// ============================================
// src/core/domain/entities/UserRoutePermission.ts
// Entidad: Permisos específicos de usuario (grant/deny)
// ============================================

export type PermissionType = 'grant' | 'deny';

export class UserRoutePermission {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly routeId: string,
    public readonly permissionType: PermissionType,
    public readonly reason: string | undefined,
    public readonly grantedBy: string | undefined,
    public readonly validFrom: Date | undefined,
    public readonly validUntil: Date | undefined,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Verificar si el permiso está activo
   */
  isActive(): boolean {
    const now = new Date();
    
    if (this.validFrom && this.validFrom > now) {
      return false;
    }
    
    if (this.validUntil && this.validUntil < now) {
      return false;
    }
    
    return true;
  }

  /**
   * Es un permiso de bloqueo
   */
  isDeny(): boolean {
    return this.permissionType === 'deny';
  }

  /**
   * Es un permiso de acceso
   */
  isGrant(): boolean {
    return this.permissionType === 'grant';
  }

  static fromDatabase(data: any): UserRoutePermission {
    return new UserRoutePermission(
      data.id,
      data.user_id,
      data.route_id,
      data.permission_type as PermissionType,
      data.reason,
      data.granted_by,
      data.valid_from ? new Date(data.valid_from) : undefined,
      data.valid_until ? new Date(data.valid_until) : undefined,
      new Date(data.created_at),
      new Date(data.updated_at)
    );
  }

  toDatabase() {
    return {
      id: this.id,
      user_id: this.userId,
      route_id: this.routeId,
      permission_type: this.permissionType,
      reason: this.reason,
      granted_by: this.grantedBy,
      valid_from: this.validFrom?.toISOString(),
      valid_until: this.validUntil?.toISOString(),
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString(),
    };
  }

  static create(
    userId: string,
    routeId: string,
    permissionType: PermissionType,
    grantedBy?: string,
    reason?: string,
    validFrom?: Date,
    validUntil?: Date
  ): UserRoutePermission {
    return new UserRoutePermission(
      crypto.randomUUID(),
      userId,
      routeId,
      permissionType,
      reason,
      grantedBy,
      validFrom,
      validUntil,
      new Date(),
      new Date()
    );
  }
}