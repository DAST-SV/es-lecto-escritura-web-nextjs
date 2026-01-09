import { IOrganizationRepository } from '@/src/core/domain/repositories/IOrganizationRepository';

export class DeleteOrganizationUseCase {
  constructor(private repository: IOrganizationRepository) {}

  async execute(id: string, userId: string, hardDelete: boolean = false): Promise<void> {
    const organization = await this.repository.findById(id);
    if (!organization) {
      throw new Error('Organización no encontrada');
    }

    if (organization.createdBy !== userId) {
      throw new Error('No tienes permiso para eliminar esta organización');
    }

    if (hardDelete) {
      await this.repository.hardDelete(id);
    } else {
      const deleted = organization.softDelete();
      await this.repository.update(id, deleted);
    }
  }
}
