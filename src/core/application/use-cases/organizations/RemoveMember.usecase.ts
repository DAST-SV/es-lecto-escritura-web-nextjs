import { IOrganizationRepository } from '@/src/core/domain/repositories/IOrganizationRepository';

export class RemoveMemberUseCase {
  constructor(private repository: IOrganizationRepository) {}

  async execute(organizationId: string, userIdToRemove: string, requestingUserId: string): Promise<void> {
    const organization = await this.repository.findById(organizationId);
    if (!organization) {
      throw new Error('Organización no encontrada');
    }

    const members = await this.repository.findMembersByOrganization(organizationId);
    const requestingMember = members.find(m => m.userId === requestingUserId);
    
    const canRemove = 
      requestingUserId === userIdToRemove ||
      requestingMember?.role === 'org_admin' ||
      organization.createdBy === requestingUserId;

    if (!canRemove) {
      throw new Error('No tienes permiso para remover este miembro');
    }

    await this.repository.removeMember(organizationId, userIdToRemove);
  }
}
