// ============================================
// src/core/application/use-cases/translation-namespaces/GetNamespaceById.ts
// Use Case: Get Namespace By ID
// ============================================

import { TranslationNamespace } from '@/src/core/domain/entities/TranslationNamespace';
import { ITranslationNamespaceRepository } from '@/src/core/domain/repositories/ITranslationNamespaceRepository';

export class GetNamespaceByIdUseCase {
  constructor(private namespaceRepository: ITranslationNamespaceRepository) {}

  async execute(id: string): Promise<TranslationNamespace | null> {
    return this.namespaceRepository.findById(id);
  }
}