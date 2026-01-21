// ============================================
// Ruta: src/core/application/use-cases/translation-keys/UpdateTranslationKey.ts
// Descripción: Caso de uso para actualizar una clave de traducción
// ============================================

import { TranslationKey } from '@/src/core/domain/entities/TranslationKey';
import { 
  ITranslationKeyRepository,
  UpdateTranslationKeyDTO 
} from '@/src/core/domain/repositories/ITranslationKeyRepository';

export class UpdateTranslationKeyUseCase {
  constructor(private repository: ITranslationKeyRepository) {}

  async execute(id: string, dto: UpdateTranslationKeyDTO): Promise<TranslationKey> {
    // Validación: ID requerido
    if (!id || !id.trim()) {
      throw new Error('ID de clave es requerido');
    }

    // Validar que existe
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error(`Clave no encontrada: ${id}`);
    }

    // Validar keyName si se está actualizando
    if (dto.keyName !== undefined) {
      if (!dto.keyName.trim()) {
        throw new Error('El nombre de la clave no puede estar vacío');
      }

      const keyNameRegex = /^[a-z0-9._-]+$/i;
      if (!keyNameRegex.test(dto.keyName)) {
        throw new Error('El nombre de la clave solo puede contener letras, números, puntos, guiones y guiones bajos');
      }

      if (dto.keyName.length > 500) {
        throw new Error('El nombre de la clave no puede exceder 500 caracteres');
      }
    }

    return await this.repository.update(id, dto);
  }
}