// ============================================
// 4. src/core/application/use-cases/translations/UpdateTranslation.ts
// ============================================
import { ITranslationRepository, UpdateTranslationDTO } from '@/src/core/domain/repositories/ITranslationRepository';
import { Translation } from '@/src/core/domain/entities/Translation';

export class UpdateTranslationUseCase {
  constructor(private translationRepository: ITranslationRepository) {}

  async execute(id: string, dto: UpdateTranslationDTO): Promise<Translation> {
    const existing = await this.translationRepository.findById(id);

    if (!existing) {
      throw new Error(`Translation not found: ${id}`);
    }

    return await this.translationRepository.update(id, dto);
  }
}
