import { IOrganizationRepository } from '@/src/core/domain/repositories/IOrganizationRepository';
import { Organization } from '@/src/core/domain/entities/Organization';

export interface UpdateOrganizationDTO {
  name?: string;
  description?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  isActive?: boolean;
}

export class UpdateOrganizationUseCase {
  constructor(private repository: IOrganizationRepository) {}

  async execute(id: string, userId: string, dto: UpdateOrganizationDTO): Promise<Organization> {
    const organization = await this.repository.findById(id);
    if (!organization) {
      throw new Error('Organización no encontrada');
    }

    if (organization.createdBy !== userId) {
      throw new Error('No tienes permiso para actualizar esta organización');
    }

    const updated = organization.update(dto);
    return await this.repository.update(id, updated);
  }
}
