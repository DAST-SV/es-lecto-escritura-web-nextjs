// ============================================
// src/core/application/use-cases/organization-members/index.ts
// Use cases for Organization Members management
// ============================================

import {
  IOrganizationMemberRepository,
  CreateOrganizationMemberDTO,
  UpdateOrganizationMemberDTO
} from '@/src/core/domain/repositories/IOrganizationMemberRepository';
import { OrganizationMember, OrganizationMemberRole } from '@/src/core/domain/entities/OrganizationMember';

// ============================================
// Get Organization Members Use Case
// ============================================

export class GetOrganizationMembersUseCase {
  constructor(private repository: IOrganizationMemberRepository) {}

  async execute(organizationId: string): Promise<OrganizationMember[]> {
    if (!organizationId) {
      throw new Error('Organization ID is required');
    }

    return await this.repository.findAll(organizationId);
  }
}

// ============================================
// Get Members By User Use Case
// ============================================

export class GetMembersByUserUseCase {
  constructor(private repository: IOrganizationMemberRepository) {}

  async execute(userId: string): Promise<OrganizationMember[]> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    return await this.repository.findByUserId(userId);
  }
}

// ============================================
// Add Organization Member Use Case
// ============================================

export class AddOrganizationMemberUseCase {
  constructor(private repository: IOrganizationMemberRepository) {}

  async execute(dto: CreateOrganizationMemberDTO): Promise<OrganizationMember> {
    // Validations
    if (!dto.organizationId) {
      throw new Error('Organization ID is required');
    }

    if (!dto.userId) {
      throw new Error('User ID is required');
    }

    if (!dto.role) {
      throw new Error('Role is required');
    }

    const validRoles: OrganizationMemberRole[] = ['owner', 'admin', 'member', 'guest'];
    if (!validRoles.includes(dto.role)) {
      throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }

    // Check if user is already a member
    const existingMembers = await this.repository.findAll(dto.organizationId);
    const alreadyMember = existingMembers.find(m => m.userId === dto.userId);

    if (alreadyMember) {
      throw new Error('User is already a member of this organization');
    }

    return await this.repository.create(dto);
  }
}

// ============================================
// Update Member Role Use Case
// ============================================

export class UpdateMemberRoleUseCase {
  constructor(private repository: IOrganizationMemberRepository) {}

  async execute(
    memberId: string,
    newRole: OrganizationMemberRole,
    requestingUserId: string
  ): Promise<OrganizationMember> {
    if (!memberId) {
      throw new Error('Member ID is required');
    }

    if (!newRole) {
      throw new Error('New role is required');
    }

    const validRoles: OrganizationMemberRole[] = ['owner', 'admin', 'member', 'guest'];
    if (!validRoles.includes(newRole)) {
      throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }

    // Get the member to update
    const member = await this.repository.findById(memberId);
    if (!member) {
      throw new Error('Member not found');
    }

    // Verify requesting user has permission to update roles
    const requestingMember = await this.repository.findAll(member.organizationId);
    const requester = requestingMember.find(m => m.userId === requestingUserId);

    if (!requester) {
      throw new Error('You are not a member of this organization');
    }

    if (!requester.canManageMembers()) {
      throw new Error('You do not have permission to update member roles');
    }

    // Prevent removing the last owner
    if (member.isOwner() && newRole !== 'owner') {
      const owners = requestingMember.filter(m => m.isOwner());
      if (owners.length === 1) {
        throw new Error('Cannot change the role of the last owner');
      }
    }

    return await this.repository.update(memberId, { role: newRole });
  }
}

// ============================================
// Remove Organization Member Use Case
// ============================================

export class RemoveOrganizationMemberUseCase {
  constructor(private repository: IOrganizationMemberRepository) {}

  async execute(
    memberId: string,
    requestingUserId: string
  ): Promise<void> {
    if (!memberId) {
      throw new Error('Member ID is required');
    }

    // Get the member to remove
    const member = await this.repository.findById(memberId);
    if (!member) {
      throw new Error('Member not found');
    }

    // Verify requesting user has permission to remove members
    const organizationMembers = await this.repository.findAll(member.organizationId);
    const requester = organizationMembers.find(m => m.userId === requestingUserId);

    if (!requester) {
      throw new Error('You are not a member of this organization');
    }

    // Allow users to remove themselves
    const isSelfRemoval = member.userId === requestingUserId;

    if (!isSelfRemoval && !requester.canManageMembers()) {
      throw new Error('You do not have permission to remove members');
    }

    // Prevent removing the last owner
    if (member.isOwner()) {
      const owners = organizationMembers.filter(m => m.isOwner());
      if (owners.length === 1) {
        throw new Error('Cannot remove the last owner of the organization');
      }
    }

    await this.repository.delete(memberId);
  }
}

// Export DTOs for convenience
export type { CreateOrganizationMemberDTO, UpdateOrganizationMemberDTO };
