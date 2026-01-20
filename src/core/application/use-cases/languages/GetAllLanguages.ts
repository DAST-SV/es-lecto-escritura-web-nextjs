// ============================================
// src/core/application/use-cases/languages/GetAllLanguages.ts
// Use Case: Get All Languages
// ============================================

import { Language } from '@/src/core/domain/entities/Language';
import { ILanguageRepository } from '@/src/core/domain/repositories/ILanguageRepository';

export class GetAllLanguages {
  constructor(private languageRepository: ILanguageRepository) {}

  async execute(includeInactive = false): Promise<Language[]> {
    return this.languageRepository.findAll(includeInactive);
  }
}
