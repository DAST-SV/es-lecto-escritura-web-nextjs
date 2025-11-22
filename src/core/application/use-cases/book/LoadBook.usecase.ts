/**
 * UBICACIÓN: src/core/application/use-cases/book/LoadBook.usecase.ts
 */

import { Book } from '../../../domain/entities/Book.entity';
import { IBookRepository } from '../../../domain/repositories/IBookRepository';

export interface LoadBookDTO {
  bookId: string;
  userId: string;
}

export interface LoadBookResult {
  success: boolean;
  book: Book | null;
  message: string;
}

export class LoadBookUseCase {
  constructor(private readonly bookRepository: IBookRepository) {}

  async execute(dto: LoadBookDTO): Promise<LoadBookResult> {
    try {
      if (!dto.bookId) throw new Error('ID de libro requerido');
      if (!dto.userId) throw new Error('Usuario no autenticado');

      const book = await this.bookRepository.findById(dto.bookId);

      if (!book) {
        return {
          success: false,
          book: null,
          message: 'Libro no encontrado'
        };
      }

      if (book.userId !== dto.userId) {
        throw new Error('No tienes permiso para acceder a este libro');
      }

      return {
        success: true,
        book,
        message: 'Libro cargado correctamente'
      };
    } catch (error: any) {
      console.error('❌ Error en LoadBookUseCase:', error);
      throw new Error(error.message || 'Error al cargar el libro');
    }
  }
}