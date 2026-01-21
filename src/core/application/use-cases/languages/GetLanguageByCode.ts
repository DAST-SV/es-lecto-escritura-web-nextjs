// ============================================
// src/core/application/use-cases/languages/GetLanguageByCode.ts
// Use Case: Get Language By Code
// ============================================

import { Language } from '@/src/core/domain/entities/Language';
import { ILanguageRepository } from '@/src/core/domain/repositories/ILanguageRepository';

export class GetLanguageByCodeUseCase {
  constructor(private languageRepository: ILanguageRepository) {}

  async execute(code: string): Promise<Language | null> {
    return this.languageRepository.findByCode(code);
  }
}