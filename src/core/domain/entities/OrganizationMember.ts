// ============================================
// src/core/domain/entities/OrganizationMember.ts
// Entidad de miembro de organización
// ============================================

export type OrganizationMemberRole = 'owner' | 'admin' | 'member' | 'guest';

export class OrganizationMember {
  constructor(
    public readonly id: string,
    public readonly organizationId: string,
    public readonly userId: string,
    public readonly role: OrganizationMemberRole,
    public readonly joinedAt: Date,
    public readonly invitedBy?: string,
    public readonly isActive: boolean = true,
    // Datos relacionados (cargados con joins)
    public readonly userName?: string,
    public readonly userEmail?: string,
    public readonly organizationName?: string
  ) {}

  static fromDatabase(data: any): OrganizationMember {
    return new OrganizationMember(
      data.id,
      data.organization_id,
      data.user_id,
      data.user_role as OrganizationMemberRole,
      new Date(data.joined_at),
      data.invited_by,
      data.is_active ?? true,
      data.user_name,
      data.user_email,
      data.organization_name
    );
  }

  toDatabase() {
    return {
      id: this.id,
      organization_id: this.organizationId,
      user_id: this.userId,
      user_role: this.role,
      joined_at: this.joinedAt.toISOString(),
      invited_by: this.invitedBy,
      is_active: this.isActive,
    };
  }

  isOwner(): boolean {
    return this.role === 'owner';
  }

  isAdmin(): boolean {
    return this.role === 'admin' || this.role === 'owner';
  }

  canManageMembers(): boolean {
    return this.isAdmin();
  }

  canInviteMembers(): boolean {
    return this.isAdmin();
  }
}
