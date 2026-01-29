/**
 * ============================================
 * INTERFAZ: ICommunityRepository
 * Repositorio para comunidades de autores
 * ============================================
 */

import { Community, CommunityPlan } from '../entities/Community';
import { CommunityData, CommunityPlanData, CommunityMembershipData, MembershipStatus, BillingPeriod } from '../types';

export interface CreateCommunityDTO {
  authorId: string;
  name: string;
  description?: string;
  shortDescription?: string;
  slug: string;
  coverUrl?: string;
  welcomeMessage?: string;
  requiresApproval?: boolean;
}

export interface UpdateCommunityDTO {
  name?: string;
  description?: string;
  shortDescription?: string;
  slug?: string;
  coverUrl?: string;
  welcomeMessage?: string;
  isActive?: boolean;
  requiresApproval?: boolean;
}

export interface CreateCommunityPlanDTO {
  communityId: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  billingPeriod?: BillingPeriod;
  benefits?: string[];
  maxMembers?: number;
  isFeatured?: boolean;
  displayOrder?: number;
}

export interface UpdateCommunityPlanDTO {
  name?: string;
  description?: string;
  price?: number;
  currency?: string;
  billingPeriod?: BillingPeriod;
  benefits?: string[];
  maxMembers?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  displayOrder?: number;
}

export interface JoinCommunityDTO {
  communityId: string;
  userId: string;
  planId: string;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
}

export interface ICommunityRepository {
  // CRUD Comunidad
  findById(id: string): Promise<Community | null>;
  findBySlug(slug: string): Promise<Community | null>;
  findByAuthorId(authorId: string): Promise<Community | null>;
  findAll(filters?: { isActive?: boolean; limit?: number; offset?: number }): Promise<Community[]>;
  create(dto: CreateCommunityDTO): Promise<Community>;
  update(id: string, dto: UpdateCommunityDTO): Promise<Community>;
  delete(id: string): Promise<void>;

  // Validación
  isSlugAvailable(slug: string, excludeId?: string): Promise<boolean>;

  // Planes
  findPlanById(planId: string): Promise<CommunityPlan | null>;
  findPlansByCommunityId(communityId: string): Promise<CommunityPlan[]>;
  addPlan(dto: CreateCommunityPlanDTO): Promise<CommunityPlan>;
  updatePlan(planId: string, dto: UpdateCommunityPlanDTO): Promise<CommunityPlan>;
  deletePlan(planId: string): Promise<void>;
  reorderPlans(communityId: string, planIds: string[]): Promise<void>;

  // Membresías
  joinCommunity(dto: JoinCommunityDTO): Promise<CommunityMembershipData>;
  leaveCommunity(communityId: string, userId: string): Promise<void>;
  updateMembershipStatus(communityId: string, userId: string, status: MembershipStatus): Promise<void>;
  getMembership(communityId: string, userId: string): Promise<CommunityMembershipData | null>;
  getMembershipsByUser(userId: string): Promise<CommunityMembershipData[]>;
  getMembershipsByCommunity(communityId: string, status?: MembershipStatus): Promise<CommunityMembershipData[]>;
  isMember(communityId: string, userId: string): Promise<boolean>;
  isActiveMember(communityId: string, userId: string): Promise<boolean>;

  // Estadísticas
  getMemberCount(communityId: string): Promise<number>;
  getActiveMemberCount(communityId: string): Promise<number>;
  getTotalRevenue(communityId: string): Promise<number>;

  // Acceso a contenido
  canAccessCommunityContent(communityId: string, userId: string): Promise<boolean>;
  getUserCommunitiesWithAccess(userId: string): Promise<string[]>;
}
