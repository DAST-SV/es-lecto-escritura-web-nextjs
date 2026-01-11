// ============================================
// 6. src/core/application/use-cases/translations/CreateBulkTranslations.ts
// ============================================
import { ITranslationRepository, BulkCreateTranslationDTO } from '@/src/core/domain/repositories/ITranslationRepository';
import { Translation } from '@/src/core/domain/entities/Translation';

export class CreateBulkTranslationsUseCase {
  constructor(private translationRepository: ITranslationRepository) {}

  async execute(dto: BulkCreateTranslationDTO): Promise<Translation[]> {
    // Validar que al menos hay una traducción
    if (!dto.translations || dto.translations.length === 0) {
      throw new Error('At least one translation is required');
    }

    return await this.translationRepository.createBulk(dto);
  }
}