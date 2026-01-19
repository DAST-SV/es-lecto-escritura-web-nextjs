// ============================================
// src/core/domain/entities/UserRelationship.ts
// Entidad de relación entre usuarios
// ============================================

export type RelationshipType = 'parent' | 'tutor' | 'teacher' | 'guardian';

export class UserRelationship {
  constructor(
    public readonly id: string,
    public readonly parentUserId: string,
    public readonly childUserId: string,
    public readonly relationshipType: RelationshipType,
    public readonly isApproved: boolean,
    public readonly approvedAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    // Datos relacionados (cargados con joins)
    public readonly parentUserName?: string,
    public readonly parentUserEmail?: string,
    public readonly childUserName?: string,
    public readonly childUserEmail?: string
  ) {}

  static fromDatabase(data: any): UserRelationship {
    return new UserRelationship(
      data.id,
      data.parent_user_id,
      data.child_user_id,
      data.relationship_type as RelationshipType,
      data.is_approved ?? false,
      data.approved_at ? new Date(data.approved_at) : null,
      new Date(data.created_at),
      new Date(data.updated_at),
      data.parent_user_name,
      data.parent_user_email,
      data.child_user_name,
      data.child_user_email
    );
  }

  toDatabase() {
    return {
      id: this.id,
      parent_user_id: this.parentUserId,
      child_user_id: this.childUserId,
      relationship_type: this.relationshipType,
      is_approved: this.isApproved,
      approved_at: this.approvedAt?.toISOString() || null,
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString(),
    };
  }

  isPending(): boolean {
    return !this.isApproved;
  }

  canBeApproved(): boolean {
    return this.isPending();
  }

  validateNotSelfRelationship(): void {
    if (this.parentUserId === this.childUserId) {
      throw new Error('Users cannot create relationships with themselves');
    }
  }

  getRelationshipTypeLabel(): string {
    const labels: Record<RelationshipType, string> = {
      parent: 'Padre/Madre',
      tutor: 'Tutor',
      teacher: 'Profesor',
      guardian: 'Guardián',
    };
    return labels[this.relationshipType];
  }

  getRelationshipTypeBadgeColor(): string {
    const colors: Record<RelationshipType, string> = {
      parent: 'bg-blue-100 text-blue-800',
      tutor: 'bg-green-100 text-green-800',
      teacher: 'bg-purple-100 text-purple-800',
      guardian: 'bg-orange-100 text-orange-800',
    };
    return colors[this.relationshipType];
  }
}
