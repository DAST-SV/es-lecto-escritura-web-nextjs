// ============================================
// src/core/application/use-cases/translation-namespaces/UpdateNamespace.ts
// Use Case: Update Translation Namespace
// ============================================

import { TranslationNamespace } from '@/src/core/domain/entities/TranslationNamespace';
import { ITranslationNamespaceRepository, UpdateTranslationNamespaceDTO } from '@/src/core/domain/repositories/ITranslationNamespaceRepository';

export class UpdateNamespaceUseCase {
  constructor(private namespaceRepository: ITranslationNamespaceRepository) {}

  async execute(id: string, dto: UpdateTranslationNamespaceDTO): Promise<TranslationNamespace> {
    const existing = await this.namespaceRepository.findById(id);
    if (!existing) {
      throw new Error(`Namespace no encontrado: ${id}`);
    }

    return this.namespaceRepository.update(id, dto);
  }
}