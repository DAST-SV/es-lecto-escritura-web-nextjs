// ============================================
// src/core/application/use-cases/translation-namespaces/GetAllNamespaces.ts
// Use Case: Get All Translation Namespaces
// ============================================

import { TranslationNamespace } from '@/src/core/domain/entities/TranslationNamespace';
import { ITranslationNamespaceRepository } from '@/src/core/domain/repositories/ITranslationNamespaceRepository';

export class GetAllNamespacesUseCase {
  constructor(private namespaceRepository: ITranslationNamespaceRepository) {}

  async execute(includeInactive = false): Promise<TranslationNamespace[]> {
    return this.namespaceRepository.findAll(includeInactive);
  }
}