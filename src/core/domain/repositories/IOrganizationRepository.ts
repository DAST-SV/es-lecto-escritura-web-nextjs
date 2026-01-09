import { Organization, OrganizationMember } from '../entities/Organization';
export interface IOrganizationRepository {
  create(organization: Organization): Promise<Organization>;
  update(id: string, organization: Organization): Promise<Organization>;
  findById(id: string): Promise<Organization | null>;
  findAll(): Promise<Organization[]>;
  findByUserId(userId: string): Promise<Organization[]>;
  hardDelete(id: string): Promise<void>;
  existsBySlug(slug: string, excludeId?: string): Promise<boolean>;
  addMember(member: OrganizationMember): Promise<OrganizationMember>;
  removeMember(organizationId: string, userId: string): Promise<void>;
  updateMember(organizationId: string, userId: string, member: OrganizationMember): Promise<OrganizationMember>;
  findMembersByOrganization(organizationId: string): Promise<OrganizationMember[]>;
}
