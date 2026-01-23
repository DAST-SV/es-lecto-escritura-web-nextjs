import { IOrganizationRepository } from '@/src/core/domain/repositories/IOrganizationRepository';
import { Organization, OrganizationType } from '@/src/core/domain/entities/Organization';

export interface CreateOrganizationDTO {
  organizationType: OrganizationType;
  name: string;
  slug: string;
  description?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
}

export class CreateOrganizationUseCase {
  constructor(private repository: IOrganizationRepository) {}

  async execute(createdBy: string, dto: CreateOrganizationDTO): Promise<Organization> {
    const exists = await this.repository.existsBySlug(dto.slug);
    if (exists) {
      throw new Error(`Ya existe una organización con el slug "${dto.slug}"`);
    }

    const organization = Organization.create(
      dto.organizationType,
      dto.name,
      dto.slug,
      createdBy,
      dto.description,
      dto.email
    );

    return await this.repository.create(organization);
  }
}
