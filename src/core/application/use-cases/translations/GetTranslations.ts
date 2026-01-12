// ============================================
// src/core/application/use-cases/translations/GetTranslations.ts
// ✅ CORREGIDO: usar keyName en lugar de translationKey
// ============================================
import { ITranslationRepository } from '@/src/core/domain/repositories/ITranslationRepository';
import { Translation } from '@/src/core/domain/entities/Translation';

export class GetTranslationsUseCase {
  constructor(private translationRepository: ITranslationRepository) {}

  async execute(namespaceSlug: string, languageCode: string): Promise<Record<string, string>> {
    const translations = await this.translationRepository.findByNamespace(namespaceSlug);
    
    const result: Record<string, string> = {};
    
    translations
      .filter((t: Translation) => t.languageCode === languageCode)
      .forEach((t: Translation) => {
        // ✅ CORRECCIÓN: usar keyName en lugar de translationKey
        result[t.keyName] = t.value;
      });
    
    return result;
  }
}