/**
 * UBICACIÓN: src/core/application/use-cases/book/SaveBook.usecase.ts
 */

import { Book } from '../../../domain/entities/Book.entity';
import { IBookRepository } from '../../../domain/repositories/IBookRepository';
import { IStorageService } from '../../ports/IStorageService';

export interface SaveBookDTO {
  book: Book;
  userId: string;
  bookId?: string;
}

export interface SaveBookResult {
  success: boolean;
  bookId: string;
  message: string;
}

export class SaveBookUseCase {
  constructor(
    private readonly bookRepository: IBookRepository,
    private readonly storageService: IStorageService
  ) {}

  async execute(dto: SaveBookDTO): Promise<SaveBookResult> {
    try {
      if (!dto.userId) throw new Error('Usuario no autenticado');
      if (!dto.book) throw new Error('Libro inválido');

      dto.book.validate();

      if (dto.bookId) {
        await this.storageService.deleteFolder('ImgLibros', `${dto.userId}/${dto.bookId}`);
      }

      const bookId = dto.bookId || await this.bookRepository.save(dto.book);

      return {
        success: true,
        bookId,
        message: dto.bookId ? '📚 Libro actualizado correctamente' : '📚 Libro guardado correctamente'
      };
    } catch (error: any) {
      console.error('❌ Error en SaveBookUseCase:', error);
      throw new Error(error.message || 'Error al guardar el libro');
    }
  }
}