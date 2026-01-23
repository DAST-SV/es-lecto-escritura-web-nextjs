// ============================================
// src/core/application/use-cases/languages/CreateLanguage.ts
// Use Case: Create Language
// ============================================

import { Language } from '@/src/core/domain/entities/Language';
import { ILanguageRepository, CreateLanguageDTO } from '@/src/core/domain/repositories/ILanguageRepository';

export class CreateLanguageUseCase {
  constructor(private languageRepository: ILanguageRepository) {}

  async execute(dto: CreateLanguageDTO): Promise<Language> {
    // Validar que no exista
    const existing = await this.languageRepository.findByCode(dto.code);
    if (existing) {
      throw new Error(`El idioma con código ${dto.code} ya existe`);
    }

    return this.languageRepository.create(dto);
  }
}