import { IOrganizationRepository } from '@/src/core/domain/repositories/IOrganizationRepository';
import { Organization } from '@/src/core/domain/entities/Organization';

export class GetUserOrganizationsUseCase {
  constructor(private repository: IOrganizationRepository) {}

  async execute(userId: string): Promise<Organization[]> {
    if (!userId) {
      throw new Error('ID de usuario es requerido');
    }
    return await this.repository.findByUserId(userId);
  }
}
