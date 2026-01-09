// ============================================
// src/core/domain/entities/Organization.ts
// ✅ NUEVA ENTIDAD: Reemplaza UserType
// ============================================

export type OrganizationType = 
  | 'educational_institution'
  | 'family'
  | 'group'
  | 'couple'
  | 'individual'
  | 'library'
  | 'community_center';

export type UserRole = 
  | 'super_admin'
  | 'org_admin'
  | 'teacher'
  | 'parent'
  | 'student'
  | 'reader'
  | 'librarian'
  | 'coordinator';

export type MembershipStatus = 
  | 'active'
  | 'inactive'
  | 'suspended'
  | 'pending'
  | 'expired';

export class Organization {
  constructor(
    public readonly id: string,
    public readonly organizationType: OrganizationType,
    public readonly name: string,
    public readonly slug: string,
    public readonly description: string | null,
    public readonly email: string | null,
    public readonly phone: string | null,
    public readonly website: string | null,
    public readonly countryCode: string | null,
    public readonly state: string | null,
    public readonly city: string | null,
    public readonly address: string | null,
    public readonly postalCode: string | null,
    public readonly timezone: string,
    public readonly maxMembers: number | null,
    public readonly settings: Record<string, any>,
    public readonly isActive: boolean,
    public readonly isVerified: boolean,
    public readonly verifiedAt: Date | null,
    public readonly logoUrl: string | null,
    public readonly primaryColor: string | null,
    public readonly createdBy: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: Date | null = null
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error('El nombre de la organización es requerido');
    }

    if (this.name.trim().length < 3) {
      throw new Error('El nombre debe tener al menos 3 caracteres');
    }

    if (this.name.trim().length > 200) {
      throw new Error('El nombre no puede exceder 200 caracteres');
    }

    if (!this.slug || this.slug.trim().length === 0) {
      throw new Error('El slug es requerido');
    }

    if (!/^[a-z0-9-]+$/.test(this.slug)) {
      throw new Error('El slug solo puede contener letras minúsculas, números y guiones');
    }

    if (this.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      throw new Error('Email inválido');
    }

    if (this.maxMembers !== null && this.maxMembers <= 0) {
      throw new Error('El máximo de miembros debe ser mayor a 0');
    }
  }

  public update(data: Partial<{
    name: string;
    description: string | null;
    email: string | null;
    phone: string | null;
    website: string | null;
    isActive: boolean;
    logoUrl: string | null;
    primaryColor: string | null;
    settings: Record<string, any>;
  }>): Organization {
    return new Organization(
      this.id,
      this.organizationType,
      data.name ?? this.name,
      this.slug,
      data.description ?? this.description,
      data.email ?? this.email,
      data.phone ?? this.phone,
      data.website ?? this.website,
      this.countryCode,
      this.state,
      this.city,
      this.address,
      this.postalCode,
      this.timezone,
      this.maxMembers,
      data.settings ?? this.settings,
      data.isActive ?? this.isActive,
      this.isVerified,
      this.verifiedAt,
      data.logoUrl ?? this.logoUrl,
      data.primaryColor ?? this.primaryColor,
      this.createdBy,
      this.createdAt,
      new Date(),
      this.deletedAt
    );
  }

  public softDelete(): Organization {
    return new Organization(
      this.id,
      this.organizationType,
      this.name,
      this.slug,
      this.description,
      this.email,
      this.phone,
      this.website,
      this.countryCode,
      this.state,
      this.city,
      this.address,
      this.postalCode,
      this.timezone,
      this.maxMembers,
      this.settings,
      false, // isActive = false
      this.isVerified,
      this.verifiedAt,
      this.logoUrl,
      this.primaryColor,
      this.createdBy,
      this.createdAt,
      new Date(),
      new Date() // deletedAt = now
    );
  }

  public toPlainObject() {
    return {
      id: this.id,
      organization_type: this.organizationType,
      name: this.name,
      slug: this.slug,
      description: this.description,
      email: this.email,
      phone: this.phone,
      website: this.website,
      country_code: this.countryCode,
      state: this.state,
      city: this.city,
      address: this.address,
      postal_code: this.postalCode,
      timezone: this.timezone,
      max_members: this.maxMembers,
      settings: this.settings,
      is_active: this.isActive,
      is_verified: this.isVerified,
      verified_at: this.verifiedAt,
      logo_url: this.logoUrl,
      primary_color: this.primaryColor,
      created_by: this.createdBy,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
      deleted_at: this.deletedAt,
    };
  }

  public static fromDatabase(data: any): Organization {
    return new Organization(
      data.id,
      data.organization_type,
      data.name,
      data.slug,
      data.description,
      data.email,
      data.phone,
      data.website,
      data.country_code,
      data.state,
      data.city,
      data.address,
      data.postal_code,
      data.timezone || 'UTC',
      data.max_members,
      data.settings || {},
      data.is_active ?? true,
      data.is_verified ?? false,
      data.verified_at ? new Date(data.verified_at) : null,
      data.logo_url,
      data.primary_color,
      data.created_by,
      new Date(data.created_at),
      new Date(data.updated_at),
      data.deleted_at ? new Date(data.deleted_at) : null
    );
  }

  public static create(
    organizationType: OrganizationType,
    name: string,
    slug: string,
    createdBy: string,
    description?: string | null,
    email?: string | null
  ): Organization {
    return new Organization(
      crypto.randomUUID(),
      organizationType,
      name,
      slug,
      description || null,
      email || null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      'UTC',
      null,
      {},
      true,
      false,
      null,
      null,
      null,
      createdBy,
      new Date(),
      new Date(),
      null
    );
  }
}

// ============================================
// ENTIDAD: OrganizationMember
// ============================================

export class OrganizationMember {
  constructor(
    public readonly id: string,
    public readonly organizationId: string,
    public readonly userId: string,
    public readonly role: UserRole,
    public readonly permissions: string[],
    public readonly status: MembershipStatus,
    public readonly joinedAt: Date,
    public readonly invitedBy: string | null,
    public readonly invitationToken: string | null,
    public readonly invitationExpiresAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: Date | null = null
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.organizationId) {
      throw new Error('Organization ID es requerido');
    }
    if (!this.userId) {
      throw new Error('User ID es requerido');
    }
    if (!this.role) {
      throw new Error('Role es requerido');
    }
  }

  public updateRole(newRole: UserRole): OrganizationMember {
    return new OrganizationMember(
      this.id,
      this.organizationId,
      this.userId,
      newRole,
      this.permissions,
      this.status,
      this.joinedAt,
      this.invitedBy,
      this.invitationToken,
      this.invitationExpiresAt,
      this.createdAt,
      new Date(),
      this.deletedAt
    );
  }

  public updateStatus(newStatus: MembershipStatus): OrganizationMember {
    return new OrganizationMember(
      this.id,
      this.organizationId,
      this.userId,
      this.role,
      this.permissions,
      newStatus,
      this.joinedAt,
      this.invitedBy,
      this.invitationToken,
      this.invitationExpiresAt,
      this.createdAt,
      new Date(),
      this.deletedAt
    );
  }

  public toPlainObject() {
    return {
      id: this.id,
      organization_id: this.organizationId,
      user_id: this.userId,
      role: this.role,
      permissions: this.permissions,
      status: this.status,
      joined_at: this.joinedAt,
      invited_by: this.invitedBy,
      invitation_token: this.invitationToken,
      invitation_expires_at: this.invitationExpiresAt,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
      deleted_at: this.deletedAt,
    };
  }

  public static fromDatabase(data: any): OrganizationMember {
    return new OrganizationMember(
      data.id,
      data.organization_id,
      data.user_id,
      data.role,
      data.permissions || [],
      data.status,
      new Date(data.joined_at),
      data.invited_by,
      data.invitation_token,
      data.invitation_expires_at ? new Date(data.invitation_expires_at) : null,
      new Date(data.created_at),
      new Date(data.updated_at),
      data.deleted_at ? new Date(data.deleted_at) : null
    );
  }

  public static create(
    organizationId: string,
    userId: string,
    role: UserRole,
    invitedBy?: string | null
  ): OrganizationMember {
    return new OrganizationMember(
      crypto.randomUUID(),
      organizationId,
      userId,
      role,
      [],
      'pending',
      new Date(),
      invitedBy || null,
      crypto.randomUUID(),
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
      new Date(),
      new Date(),
      null
    );
  }
}