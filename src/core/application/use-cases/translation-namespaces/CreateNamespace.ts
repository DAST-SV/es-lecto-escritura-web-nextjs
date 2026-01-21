// ============================================
// src/core/application/use-cases/translation-namespaces/CreateNamespace.ts
// Use Case: Create Translation Namespace
// ============================================

import { TranslationNamespace } from '@/src/core/domain/entities/TranslationNamespace';
import { ITranslationNamespaceRepository, CreateTranslationNamespaceDTO } from '@/src/core/domain/repositories/ITranslationNamespaceRepository';

export class CreateNamespaceUseCase {
  constructor(private namespaceRepository: ITranslationNamespaceRepository) {}

  async execute(dto: CreateTranslationNamespaceDTO): Promise<TranslationNamespace> {
    // Validar que no exista
    const existing = await this.namespaceRepository.findBySlug(dto.slug);
    if (existing) {
      throw new Error(`El namespace con slug ${dto.slug} ya existe`);
    }

    return this.namespaceRepository.create(dto);
  }
}