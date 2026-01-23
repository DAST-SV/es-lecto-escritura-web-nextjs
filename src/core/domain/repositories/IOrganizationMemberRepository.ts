// ============================================
// src/core/domain/repositories/IOrganizationMemberRepository.ts
// Repository interface for Organization Members
// ============================================

import { OrganizationMember } from '../entities/OrganizationMember';

export interface IOrganizationMemberRepository {
  findAll(organizationId: string): Promise<OrganizationMember[]>;
  findById(id: string): Promise<OrganizationMember | null>;
  findByUserId(userId: string): Promise<OrganizationMember[]>;
  create(dto: CreateOrganizationMemberDTO): Promise<OrganizationMember>;
  update(id: string, dto: UpdateOrganizationMemberDTO): Promise<OrganizationMember>;
  delete(id: string): Promise<void>;
}

export interface CreateOrganizationMemberDTO {
  organizationId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member' | 'guest';
  invitedBy?: string;
}

export interface UpdateOrganizationMemberDTO {
  role?: 'owner' | 'admin' | 'member' | 'guest';
  isActive?: boolean;
}
