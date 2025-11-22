/**
 * UBICACIÓN: src/core/application/use-cases/book/DeleteBook.usecase.ts
 * 
 * Caso de uso para eliminar un libro
 */

import { IBookRepository } from '../../../domain/repositories/IBookRepository';
import { IStorageService } from '../../ports/IStorageService';

export interface DeleteBookDTO {
  bookId: string;
  userId: string;
}

export interface DeleteBookResult {
  success: boolean;
  message: string;
}

export class DeleteBookUseCase {
  constructor(
    private readonly bookRepository: IBookRepository,
    private readonly storageService: IStorageService
  ) {}

  async execute(dto: DeleteBookDTO): Promise<DeleteBookResult> {
    try {
      // 1. Validar datos de entrada
      if (!dto.bookId) {
        throw new Error('ID de libro requerido');
      }

      if (!dto.userId) {
        throw new Error('Usuario no autenticado');
      }

      // 2. Verificar que el libro existe y pertenece al usuario
      const book = await this.bookRepository.findById(dto.bookId);

      if (!book) {
        throw new Error('Libro no encontrado');
      }

      if (book.userId !== dto.userId) {
        throw new Error('No tienes permiso para eliminar este libro');
      }

      // 3. Eliminar archivos del storage
      await this.storageService.deleteFolder(
        'ImgLibros',
        `${dto.userId}/${dto.bookId}`
      );

      // 4. Eliminar libro de la base de datos
      await this.bookRepository.delete(dto.bookId);

      return {
        success: true,
        message: '🗑️ Libro eliminado correctamente'
      };

    } catch (error: any) {
      console.error('❌ Error en DeleteBookUseCase:', error);
      throw new Error(error.message || 'Error al eliminar el libro');
    }
  }
}