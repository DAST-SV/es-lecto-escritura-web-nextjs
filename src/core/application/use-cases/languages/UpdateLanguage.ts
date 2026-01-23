// ============================================
// src/core/application/use-cases/languages/UpdateLanguage.ts
// Use Case: Update Language
// ============================================

import { Language } from '@/src/core/domain/entities/Language';
import { ILanguageRepository, UpdateLanguageDTO } from '@/src/core/domain/repositories/ILanguageRepository';

export class UpdateLanguageUseCase {
  constructor(private languageRepository: ILanguageRepository) {}

  async execute(code: string, dto: UpdateLanguageDTO): Promise<Language> {
    const existing = await this.languageRepository.findByCode(code);
    if (!existing) {
      throw new Error(`Idioma no encontrado: ${code}`);
    }

    return this.languageRepository.update(code, dto);
  }
}