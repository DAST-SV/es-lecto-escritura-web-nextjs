// ============================================
// src/core/domain/entities/UserRole.ts
// Domain Entity: UserRole (User-Role Assignment)
// ============================================

export class UserRole {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly roleId: string,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly revokedAt: Date | null,
    public readonly assignedBy: string | null,
    public readonly revokedBy: string | null,
    public readonly notes: string | null,
    // Relations (optional, populated from JOINs)
    public readonly userName?: string,
    public readonly userEmail?: string,
    public readonly roleName?: string,
    public readonly roleDisplayName?: string
  ) {}

  /**
   * Creates a UserRole instance from database row
   */
  static fromDatabase(data: any): UserRole {
    return new UserRole(
      data.id,
      data.user_id,
      data.role_id,
      data.is_active ?? true,
      new Date(data.created_at),
      new Date(data.updated_at),
      data.revoked_at ? new Date(data.revoked_at) : null,
      data.assigned_by,
      data.revoked_by,
      data.notes,
      // Relations
      data.user_name || data.users?.email?.split('@')[0],
      data.user_email || data.users?.email,
      data.role_name || data.roles?.name,
      data.role_display_name || data.roles?.display_name
    );
  }

  /**
   * Checks if the assignment is currently active
   */
  isAssignmentActive(): boolean {
    return this.isActive && this.revokedAt === null;
  }

  /**
   * Checks if the assignment has been revoked
   */
  isRevoked(): boolean {
    return this.revokedAt !== null;
  }

  /**
   * Gets display name for the user
   */
  getUserDisplay(): string {
    return this.userName || this.userEmail || this.userId;
  }

  /**
   * Gets display name for the role
   */
  getRoleDisplay(): string {
    return this.roleDisplayName || this.roleName || this.roleId;
  }

  /**
   * Checks if assignment can be revoked
   */
  canBeRevoked(): boolean {
    return this.isActive && !this.isRevoked();
  }

  /**
   * Gets the assignment duration in days
   */
  getAssignmentDuration(): number {
    const endDate = this.revokedAt || new Date();
    const diffMs = endDate.getTime() - this.createdAt.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  /**
   * Converts to plain object for serialization
   */
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      roleId: this.roleId,
      isActive: this.isActive,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      revokedAt: this.revokedAt?.toISOString() || null,
      assignedBy: this.assignedBy,
      revokedBy: this.revokedBy,
      notes: this.notes,
      userName: this.userName,
      userEmail: this.userEmail,
      roleName: this.roleName,
      roleDisplayName: this.roleDisplayName,
    };
  }
}
