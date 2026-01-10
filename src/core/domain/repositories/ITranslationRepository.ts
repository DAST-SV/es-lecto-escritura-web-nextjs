///////////////////////////////////////////////////////////
/// src/core/domain/repositories/ITranslationRepository.ts
///////////////////////////////////////////////////////////

// Contrato de repositorio (puerto)
import { Translation, Language } from '../entities/Translation';

export interface ITranslationRepository {
  getTranslationsByNamespace(
    namespace: string,
    languageCode: string
  ): Promise<Translation[]>;
  
  getActiveLanguages(): Promise<Language[]>;
  
  getDefaultLanguage(): Promise<string>;
}