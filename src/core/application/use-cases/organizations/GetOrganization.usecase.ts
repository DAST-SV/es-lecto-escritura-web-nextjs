import { IOrganizationRepository } from '@/src/core/domain/repositories/IOrganizationRepository';
import { Organization } from '@/src/core/domain/entities/Organization';

export class GetOrganizationUseCase {
  constructor(private repository: IOrganizationRepository) {}

  async execute(id: string): Promise<Organization> {
    const organization = await this.repository.findById(id);
    if (!organization) {
      throw new Error('Organización no encontrada');
    }
    return organization;
  }
}
