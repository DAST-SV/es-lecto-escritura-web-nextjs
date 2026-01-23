import { IOrganizationRepository } from '@/src/core/domain/repositories/IOrganizationRepository';
import { OrganizationMember, UserRole } from '@/src/core/domain/entities/Organization';

export class AddMemberUseCase {
  constructor(private repository: IOrganizationRepository) {}

  async execute(organizationId: string, userId: string, role: UserRole, invitedBy: string): Promise<OrganizationMember> {
    const organization = await this.repository.findById(organizationId);
    if (!organization) {
      throw new Error('Organización no encontrada');
    }

    const existingMembers = await this.repository.findMembersByOrganization(organizationId);
    const alreadyMember = existingMembers.some(m => m.userId === userId);
    
    if (alreadyMember) {
      throw new Error('El usuario ya es miembro de esta organización');
    }

    const member = OrganizationMember.create(organizationId, userId, role, invitedBy);
    return await this.repository.addMember(member);
  }
}
