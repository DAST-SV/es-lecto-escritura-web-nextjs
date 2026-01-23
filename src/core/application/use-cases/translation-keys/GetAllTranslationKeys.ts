// ============================================
// Ruta: src/core/application/use-cases/translation-keys/GetAllTranslationKeys.ts
// Descripción: Caso de uso para obtener todas las claves de traducción
// ============================================

import { TranslationKey } from '@/src/core/domain/entities/TranslationKey';
import { ITranslationKeyRepository } from '@/src/core/domain/repositories/ITranslationKeyRepository';

export class GetAllTranslationKeysUseCase {
  constructor(private repository: ITranslationKeyRepository) {}

  async execute(): Promise<TranslationKey[]> {
    return await this.repository.findAll();
  }
}