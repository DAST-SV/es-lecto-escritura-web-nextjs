// ============================================
// src/core/application/use-cases/languages/DeleteLanguage.ts
// Use Case: Delete Language
// ============================================

import { ILanguageRepository } from '@/src/core/domain/repositories/ILanguageRepository';

export class DeleteLanguageUseCase {
  constructor(private languageRepository: ILanguageRepository) {}

  async execute(code: string): Promise<void> {
    const existing = await this.languageRepository.findByCode(code);
    if (!existing) {
      throw new Error(`Idioma no encontrado: ${code}`);
    }

    await this.languageRepository.delete(code);
  }
}