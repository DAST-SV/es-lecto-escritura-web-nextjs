// ============================================
// Ruta: src/core/application/use-cases/translation-keys/CreateTranslationKey.ts
// Descripción: Caso de uso para crear una clave de traducción
// ============================================

import { TranslationKey } from '@/src/core/domain/entities/TranslationKey';
import { 
  ITranslationKeyRepository,
  CreateTranslationKeyDTO 
} from '@/src/core/domain/repositories/ITranslationKeyRepository';

export class CreateTranslationKeyUseCase {
  constructor(private repository: ITranslationKeyRepository) {}

  async execute(dto: CreateTranslationKeyDTO): Promise<TranslationKey> {
    // Validación: namespace requerido
    if (!dto.namespaceSlug || !dto.namespaceSlug.trim()) {
      throw new Error('El namespace es requerido');
    }

    // Validación: keyName requerido
    if (!dto.keyName || !dto.keyName.trim()) {
      throw new Error('El nombre de la clave es requerido');
    }

    // Validación: formato del keyName (solo letras, números, puntos, guiones y guiones bajos)
    const keyNameRegex = /^[a-z0-9._-]+$/i;
    if (!keyNameRegex.test(dto.keyName)) {
      throw new Error('El nombre de la clave solo puede contener letras, números, puntos, guiones y guiones bajos');
    }

    // Validación: longitud máxima
    if (dto.keyName.length > 500) {
      throw new Error('El nombre de la clave no puede exceder 500 caracteres');
    }

    // Crear la clave
    return await this.repository.create(dto);
  }
}