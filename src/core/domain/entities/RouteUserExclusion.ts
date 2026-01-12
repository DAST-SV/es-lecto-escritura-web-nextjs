// ============================================
// src/core/domain/entities/RouteUserExclusion.ts
// ============================================

export class RouteUserExclusion {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly routeId: string,
    public readonly reason: string | undefined,
    public readonly excludedAt: Date,
    public readonly expiresAt: Date | undefined,
    public readonly createdBy: string | undefined
  ) {}

  isActive(): boolean {
    if (!this.expiresAt) return true;
    return this.expiresAt > new Date();
  }

  static fromDatabase(data: any): RouteUserExclusion {
    return new RouteUserExclusion(
      data.id,
      data.user_id,
      data.route_id,
      data.reason,
      new Date(data.excluded_at),
      data.expires_at ? new Date(data.expires_at) : undefined,
      data.created_by
    );
  }

  toDatabase() {
    return {
      id: this.id,
      user_id: this.userId,
      route_id: this.routeId,
      reason: this.reason,
      excluded_at: this.excludedAt.toISOString(),
      expires_at: this.expiresAt?.toISOString(),
      created_by: this.createdBy,
    };
  }
}