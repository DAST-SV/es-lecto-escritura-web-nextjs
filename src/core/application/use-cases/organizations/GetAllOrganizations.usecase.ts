import { IOrganizationRepository } from '@/src/core/domain/repositories/IOrganizationRepository';
import { Organization } from '@/src/core/domain/entities/Organization';

export class GetAllOrganizationsUseCase {
  constructor(private repository: IOrganizationRepository) {}

  async execute(): Promise<Organization[]> {
    return await this.repository.findAll();
  }
}
