// ============================================
// src/core/domain/entities/RoutePermission.ts
// ============================================

export class RoutePermission {
  constructor(
    public readonly id: string,
    public readonly routeId: string,
    public readonly roleName: string | undefined,
    public readonly permissionBoxId: string | undefined,
    public readonly languageCode: string | undefined,
    public readonly createdAt: Date
  ) {}

  static fromDatabase(data: any): RoutePermission {
    return new RoutePermission(
      data.id,
      data.route_id,
      data.role_name,
      data.permission_box_id,
      data.language_code,
      new Date(data.created_at)
    );
  }

  toDatabase() {
    return {
      id: this.id,
      route_id: this.routeId,
      role_name: this.roleName,
      permission_box_id: this.permissionBoxId,
      language_code: this.languageCode,
      created_at: this.createdAt.toISOString(),
    };
  }
}