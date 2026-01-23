import { IOrganizationRepository } from '@/src/core/domain/repositories/IOrganizationRepository';
import { OrganizationMember, UserRole } from '@/src/core/domain/entities/Organization';

export class UpdateMemberRoleUseCase {
  constructor(private repository: IOrganizationRepository) {}

  async execute(organizationId: string, userId: string, newRole: UserRole, requestingUserId: string): Promise<OrganizationMember> {
    const organization = await this.repository.findById(organizationId);
    if (!organization) {
      throw new Error('Organización no encontrada');
    }

    const members = await this.repository.findMembersByOrganization(organizationId);
    const requestingMember = members.find(m => m.userId === requestingUserId);
    
    const canUpdate = 
      requestingMember?.role === 'org_admin' ||
      organization.createdBy === requestingUserId;

    if (!canUpdate) {
      throw new Error('No tienes permiso para actualizar roles');
    }

    const memberToUpdate = members.find(m => m.userId === userId);
    if (!memberToUpdate) {
      throw new Error('Miembro no encontrado en esta organización');
    }

    const updated = memberToUpdate.updateRole(newRole);
    return await this.repository.updateMember(organizationId, userId, updated);
  }
}
