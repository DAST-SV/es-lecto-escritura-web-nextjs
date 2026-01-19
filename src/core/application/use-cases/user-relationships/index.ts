// ============================================
// src/core/application/use-cases/user-relationships/index.ts
// Use cases for User Relationships management
// ============================================

import {
  IUserRelationshipRepository,
  CreateUserRelationshipDTO
} from '@/src/core/domain/repositories/IUserRelationshipRepository';
import { UserRelationship, RelationshipType } from '@/src/core/domain/entities/UserRelationship';

// ============================================
// Get Relationships Use Case
// ============================================

export class GetRelationshipsUseCase {
  constructor(private repository: IUserRelationshipRepository) {}

  async execute(filters?: {
    parentUserId?: string;
    childUserId?: string;
  }): Promise<UserRelationship[]> {
    if (filters?.parentUserId) {
      return await this.repository.findByParentUserId(filters.parentUserId);
    }

    if (filters?.childUserId) {
      return await this.repository.findByChildUserId(filters.childUserId);
    }

    return await this.repository.findAll();
  }
}

// ============================================
// Get Pending Approvals Use Case
// ============================================

export class GetPendingApprovalsUseCase {
  constructor(private repository: IUserRelationshipRepository) {}

  async execute(): Promise<UserRelationship[]> {
    return await this.repository.findPendingApprovals();
  }
}

// ============================================
// Create Relationship Use Case
// ============================================

export class CreateRelationshipUseCase {
  constructor(private repository: IUserRelationshipRepository) {}

  async execute(dto: CreateUserRelationshipDTO): Promise<UserRelationship> {
    // Validations
    if (!dto.parentUserId) {
      throw new Error('Parent User ID is required');
    }

    if (!dto.childUserId) {
      throw new Error('Child User ID is required');
    }

    if (!dto.relationshipType) {
      throw new Error('Relationship type is required');
    }

    // Validate relationship type
    const validTypes: RelationshipType[] = ['parent', 'tutor', 'teacher', 'guardian'];
    if (!validTypes.includes(dto.relationshipType)) {
      throw new Error(`Invalid relationship type. Must be one of: ${validTypes.join(', ')}`);
    }

    // Validate not self-relationship
    if (dto.parentUserId === dto.childUserId) {
      throw new Error('Users cannot create relationships with themselves');
    }

    // Check if relationship already exists
    const existingRelationships = await this.repository.findByParentUserId(dto.parentUserId);
    const alreadyExists = existingRelationships.find(
      r => r.childUserId === dto.childUserId && r.relationshipType === dto.relationshipType
    );

    if (alreadyExists) {
      throw new Error('This relationship already exists');
    }

    return await this.repository.create(dto);
  }
}

// ============================================
// Approve Relationship Use Case
// ============================================

export class ApproveRelationshipUseCase {
  constructor(private repository: IUserRelationshipRepository) {}

  async execute(relationshipId: string, approvingUserId: string): Promise<UserRelationship> {
    if (!relationshipId) {
      throw new Error('Relationship ID is required');
    }

    if (!approvingUserId) {
      throw new Error('Approving User ID is required');
    }

    // Get the relationship
    const relationship = await this.repository.findById(relationshipId);
    if (!relationship) {
      throw new Error('Relationship not found');
    }

    // Check if already approved
    if (relationship.isApproved) {
      throw new Error('Relationship is already approved');
    }

    // In a real application, you might want to verify that the approving user
    // has permission to approve this relationship (e.g., is an admin or the child user)
    // For now, we'll allow any authenticated user to approve

    return await this.repository.approve(relationshipId);
  }
}

// ============================================
// Remove Relationship Use Case
// ============================================

export class RemoveRelationshipUseCase {
  constructor(private repository: IUserRelationshipRepository) {}

  async execute(relationshipId: string, requestingUserId: string): Promise<void> {
    if (!relationshipId) {
      throw new Error('Relationship ID is required');
    }

    if (!requestingUserId) {
      throw new Error('Requesting User ID is required');
    }

    // Get the relationship
    const relationship = await this.repository.findById(relationshipId);
    if (!relationship) {
      throw new Error('Relationship not found');
    }

    // In a real application, you might want to verify that the requesting user
    // has permission to remove this relationship (e.g., is the parent user, child user, or admin)
    // For now, we'll allow any authenticated user to remove

    // Alternatively, you could add a check like:
    // const isParentOrChild = relationship.parentUserId === requestingUserId ||
    //                         relationship.childUserId === requestingUserId;
    // if (!isParentOrChild) {
    //   throw new Error('You do not have permission to remove this relationship');
    // }

    await this.repository.delete(relationshipId);
  }
}

// Export DTOs for convenience
export type { CreateUserRelationshipDTO };
