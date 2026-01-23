// ============================================
// src/core/application/use-cases/translation-namespaces/DeleteNamespace.ts
// Use Case: Delete Translation Namespace
// ============================================

import { ITranslationNamespaceRepository } from '@/src/core/domain/repositories/ITranslationNamespaceRepository';

export class DeleteNamespaceUseCase {
  constructor(private namespaceRepository: ITranslationNamespaceRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.namespaceRepository.findById(id);
    if (!existing) {
      throw new Error(`Namespace no encontrado: ${id}`);
    }

    await this.namespaceRepository.delete(id);
  }
}