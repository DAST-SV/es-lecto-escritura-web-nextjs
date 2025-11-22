/**
 * UBICACIÓN: src/core/application/use-cases/book/DuplicateBook.usecase.ts
 * 
 * Caso de uso para duplicar un libro existente
 */

import { Book } from '../../../domain/entities/Book.entity';
import { IBookRepository } from '../../../domain/repositories/IBookRepository';

export interface DuplicateBookDTO {
  bookId: string;
  userId: string;
  newTitle?: string;
}

export interface DuplicateBookResult {
  success: boolean;
  newBookId: string;
  message: string;
}

export class DuplicateBookUseCase {
  constructor(
    private readonly bookRepository: IBookRepository
  ) {}

  async execute(dto: DuplicateBookDTO): Promise<DuplicateBookResult> {
    try {
      // 1. Validar datos de entrada
      if (!dto.bookId) {
        throw new Error('ID de libro requerido');
      }

      if (!dto.userId) {
        throw new Error('Usuario no autenticado');
      }

      // 2. Obtener el libro original
      const originalBook = await this.bookRepository.findById(dto.bookId);

      if (!originalBook) {
        throw new Error('Libro no encontrado');
      }

      // 3. Verificar permisos
      if (originalBook.userId !== dto.userId) {
        throw new Error('No tienes permiso para duplicar este libro');
      }

      // 4. Crear copia del libro
      const newTitle = dto.newTitle || `${originalBook.metadata.titulo} (Copia)`;
      
      const duplicatedBook = new Book(
        null, // Nuevo ID se generará al guardar
        {
          ...originalBook.metadata,
          titulo: newTitle,
          portada: null, // La portada se debe re-subir
          portadaUrl: originalBook.metadata.portadaUrl // Mantener referencia a la original
        },
        originalBook.pages.map(page => page.clone()),
        dto.userId
      );

      // 5. Guardar el libro duplicado
      const newBookId = await this.bookRepository.save(duplicatedBook);

      return {
        success: true,
        newBookId,
        message: '📚 Libro duplicado correctamente'
      };

    } catch (error: any) {
      console.error('❌ Error en DuplicateBookUseCase:', error);
      throw new Error(error.message || 'Error al duplicar el libro');
    }
  }
}