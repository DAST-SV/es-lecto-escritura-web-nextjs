// ============================================
// src/core/domain/entities/UserRoutePermission.ts
// Domain Entity: UserRoutePermission
// ============================================

export type PermissionType = 'GRANT' | 'DENY';

export class UserRoutePermission {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly routeId: string,
    public readonly permissionType: PermissionType,
    public readonly reason: string | null,
    public readonly languageCode: string | null,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly grantedBy: string | null,
    public readonly expiresAt: Date | null,
    // Relations
    public readonly userEmail?: string,
    public readonly routePath?: string,
    public readonly routeName?: string
  ) {}

  static fromDatabase(data: any): UserRoutePermission {
    return new UserRoutePermission(
      data.id,
      data.user_id,
      data.route_id,
      data.permission_type,
      data.reason,
      data.language_code,
      data.is_active ?? true,
      new Date(data.created_at),
      new Date(data.updated_at),
      data.granted_by,
      data.expires_at ? new Date(data.expires_at) : null,
      data.users?.email,
      data.routes?.path,
      data.routes?.name
    );
  }

  isGrant(): boolean {
    return this.permissionType === 'GRANT';
  }

  isDeny(): boolean {
    return this.permissionType === 'DENY';
  }

  isExpired(): boolean {
    if (!this.expiresAt) return false;
    return this.expiresAt < new Date();
  }

  isEffective(): boolean {
    return this.isActive && !this.isExpired();
  }

  appliesToAllLanguages(): boolean {
    return this.languageCode === null;
  }

  appliesToLanguage(lang: string): boolean {
    return this.appliesToAllLanguages() || this.languageCode === lang;
  }

  getUserDisplay(): string {
    return this.userEmail || this.userId;
  }

  getRouteDisplay(): string {
    return this.routePath || this.routeName || this.routeId;
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      routeId: this.routeId,
      permissionType: this.permissionType,
      reason: this.reason,
      languageCode: this.languageCode,
      isActive: this.isActive,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      grantedBy: this.grantedBy,
      expiresAt: this.expiresAt?.toISOString() || null,
    };
  }
}
