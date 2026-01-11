// ============================================
// src/core/application/use-cases/GetTranslations.ts
// Use Case: Obtener traducciones (CORREGIDO)
// ============================================

import { ITranslationRepository } from '@/src/core/domain/repositories/ITranslationRepository';
import { Translation } from '@/src/core/domain/entities/Translation';

export class GetTranslationsUseCase {
  constructor(private translationRepository: ITranslationRepository) {}

  async execute(namespaceSlug: string, languageCode: string): Promise<Record<string, string>> {
    // Usar el método correcto del repositorio
    const translations = await this.translationRepository.findByNamespace(namespaceSlug);
    
    // Filtrar por idioma y convertir a objeto
    const result: Record<string, string> = {};
    
    translations
      .filter((translation: Translation) => translation.languageCode === languageCode)
      .forEach((translation: Translation) => {
        result[translation.translationKey] = translation.value;
      });
    
    return result;
  }

  /**
   * Obtener todas las traducciones de un namespace (todos los idiomas)
   */
  async executeAll(namespaceSlug: string): Promise<Translation[]> {
    return await this.translationRepository.findByNamespace(namespaceSlug);
  }

  /**
   * Obtener traducciones por idioma
   */
  async executeByLanguage(languageCode: string): Promise<Translation[]> {
    return await this.translationRepository.findByLanguage(languageCode);
  }
}