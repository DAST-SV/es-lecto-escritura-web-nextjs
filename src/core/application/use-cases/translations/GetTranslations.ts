// ============================================
// src/core/application/use-cases/translations/GetTranslations.ts
// ✅ VERSIÓN FINAL CORRECTA
// ============================================
import { ITranslationRepository } from '@/src/core/domain/repositories/ITranslationRepository';
import { Translation } from '@/src/core/domain/entities/Translation';

export class GetTranslationsUseCase {
  constructor(private translationRepository: ITranslationRepository) {}

  async execute(namespacePath: string, languageCode: string): Promise<Record<string, string>> {
    // Separar namespace del prefix
    // 'auth.form' → namespace='auth', prefix='form'
    // 'admin.dashboard.workflow' → namespace='admin', prefix='dashboard.workflow'
    const parts = namespacePath.split('.');
    const namespace = parts[0];
    const prefix = parts.length > 1 ? parts.slice(1).join('.') : null;

    // Obtener todas las traducciones del namespace
    const translations = await this.translationRepository.findByNamespace(namespace);
    
    const result: Record<string, string> = {};
    
    translations
      .filter((t: Translation) => t.languageCode === languageCode)
      .forEach((t: Translation) => {
        if (prefix) {
          // Si hay prefix, filtrar solo las claves que empiecen con ese prefix
          if (t.keyName.startsWith(`${prefix}.`)) {
            // Remover el prefix de la clave
            // 'form.email_label' → 'email_label'
            const keyWithoutPrefix = t.keyName.substring(prefix.length + 1);
            result[keyWithoutPrefix] = t.value;
          }
        } else {
          // Sin prefix, usar la clave completa
          result[t.keyName] = t.value;
        }
      });
    
    return result;
  }
}