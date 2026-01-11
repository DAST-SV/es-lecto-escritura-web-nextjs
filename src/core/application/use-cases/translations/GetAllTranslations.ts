// ============================================
// 2. src/core/application/use-cases/translations/GetAllTranslations.ts
// ============================================
import { ITranslationRepository } from '@/src/core/domain/repositories/ITranslationRepository';
import { Translation } from '@/src/core/domain/entities/Translation';

export class GetAllTranslationsUseCase {
  constructor(private translationRepository: ITranslationRepository) {}

  async execute(): Promise<Translation[]> {
    return await this.translationRepository.findAll();
  }
}