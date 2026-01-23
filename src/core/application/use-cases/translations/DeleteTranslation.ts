// ============================================
// 5. src/core/application/use-cases/translations/DeleteTranslation.ts
// ============================================
import { ITranslationRepository } from '@/src/core/domain/repositories/ITranslationRepository';

export class DeleteTranslationUseCase {
  constructor(private translationRepository: ITranslationRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.translationRepository.findById(id);

    if (!existing) {
      throw new Error(`Translation not found: ${id}`);
    }

    await this.translationRepository.delete(id);
  }
}