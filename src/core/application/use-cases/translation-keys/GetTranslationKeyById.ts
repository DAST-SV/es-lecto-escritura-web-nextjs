// ============================================
// Ruta: src/core/application/use-cases/translation-keys/GetTranslationKeyById.ts
// Descripción: Caso de uso para obtener una clave de traducción por ID
// ============================================

import { TranslationKey } from '@/src/core/domain/entities/TranslationKey';
import { ITranslationKeyRepository } from '@/src/core/domain/repositories/ITranslationKeyRepository';

export class GetTranslationKeyByIdUseCase {
  constructor(private repository: ITranslationKeyRepository) {}

  async execute(id: string): Promise<TranslationKey | null> {
    // Validación
    if (!id || !id.trim()) {
      throw new Error('ID de clave es requerido');
    }

    return await this.repository.findById(id);
  }
}