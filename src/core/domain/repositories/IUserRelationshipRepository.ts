// ============================================
// src/core/domain/repositories/IUserRelationshipRepository.ts
// Repository interface for User Relationships
// ============================================

import { UserRelationship, RelationshipType } from '../entities/UserRelationship';

export interface IUserRelationshipRepository {
  findAll(): Promise<UserRelationship[]>;
  findById(id: string): Promise<UserRelationship | null>;
  findByParentUserId(parentUserId: string): Promise<UserRelationship[]>;
  findByChildUserId(childUserId: string): Promise<UserRelationship[]>;
  findPendingApprovals(): Promise<UserRelationship[]>;
  create(dto: CreateUserRelationshipDTO): Promise<UserRelationship>;
  approve(id: string): Promise<UserRelationship>;
  delete(id: string): Promise<void>;
}

export interface CreateUserRelationshipDTO {
  parentUserId: string;
  childUserId: string;
  relationshipType: RelationshipType;
}
