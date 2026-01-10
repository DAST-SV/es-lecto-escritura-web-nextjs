// Caso de uso: Obtener traducciones
import { ITranslationRepository } from '@/src/core/domain/repositories/ITranslationRepository';

export class GetTranslationsUseCase {
  constructor(private repository: ITranslationRepository) {}

  async execute(
    namespace: string,
    languageCode: string
  ): Promise<Record<string, string>> {
    const translations = await this.repository.getTranslationsByNamespace(
      namespace,
      languageCode
    );

    // Convertir a formato key-value
    const translationsMap: Record<string, string> = {};
    translations.forEach(translation => {
      translationsMap[translation.translationKey] = translation.value;
    });

    return translationsMap;
  }
}