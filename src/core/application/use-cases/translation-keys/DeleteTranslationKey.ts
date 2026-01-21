// ============================================
// Ruta: src/core/application/use-cases/translation-keys/DeleteTranslationKey.ts
// Descripción: Caso de uso para eliminar una clave de traducción
// ============================================

import { ITranslationKeyRepository } from '@/src/core/domain/repositories/ITranslationKeyRepository';

export class DeleteTranslationKeyUseCase {
  constructor(private repository: ITranslationKeyRepository) {}

  async execute(id: string): Promise<void> {
    // Validación: ID requerido
    if (!id || !id.trim()) {
      throw new Error('ID de clave es requerido');
    }

    // Validar que existe
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error(`Clave no encontrada: ${id}`);
    }

    // Nota: Las traducciones asociadas se eliminarán en cascada por la BD
    // según lo definido en el esquema SQL con ON DELETE CASCADE
    await this.repository.delete(id);
  }
}