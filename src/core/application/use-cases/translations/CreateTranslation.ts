// ============================================
// 3. src/core/application/use-cases/translations/CreateTranslation.ts
// ============================================
import { ITranslationRepository, CreateTranslationDTO } from '@/src/core/domain/repositories/ITranslationRepository';
import { Translation } from '@/src/core/domain/entities/Translation';

export class CreateTranslationUseCase {
  constructor(private translationRepository: ITranslationRepository) {}

  async execute(dto: CreateTranslationDTO): Promise<Translation> {
    // Validar que no exista
    const existing = await this.translationRepository.findByKey(
      dto.namespaceSlug,
      dto.translationKey,
      dto.languageCode
    );

    if (existing) {
      throw new Error(`Translation already exists: ${dto.namespaceSlug}.${dto.translationKey} (${dto.languageCode})`);
    }

    return await this.translationRepository.create(dto);
  }
}