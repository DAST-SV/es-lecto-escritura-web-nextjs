// ============================================
// Ruta: src/core/application/use-cases/translation-keys/GetTranslationKeysByNamespace.ts
// Descripción: Caso de uso para obtener claves de traducción por namespace
// ============================================

import { TranslationKey } from '@/src/core/domain/entities/TranslationKey';
import { ITranslationKeyRepository } from '@/src/core/domain/repositories/ITranslationKeyRepository';

export class GetTranslationKeysByNamespaceUseCase {
  constructor(private repository: ITranslationKeyRepository) {}

  async execute(namespaceSlug: string): Promise<TranslationKey[]> {
    // Validación
    if (!namespaceSlug || !namespaceSlug.trim()) {
      throw new Error('Namespace slug es requerido');
    }

    return await this.repository.findByNamespace(namespaceSlug);
  }
}