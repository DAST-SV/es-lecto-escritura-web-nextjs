/**
 * UBICACIÓN: src/core/application/use-cases/book/ListBooks.usecase.ts
 * 
 * Caso de uso para listar libros de un usuario
 */

import { Book } from '../../../domain/entities/Book.entity';
import { IBookRepository } from '../../../domain/repositories/IBookRepository';

export interface ListBooksDTO {
  userId: string;
  filter?: {
    searchTerm?: string;
    category?: string;
    genre?: string;
    level?: number;
  };
  sort?: {
    field: 'titulo' | 'createdAt' | 'updatedAt';
    order: 'asc' | 'desc';
  };
}

export interface ListBooksResult {
  success: boolean;
  books: Book[];
  total: number;
  message?: string;
}

export class ListBooksUseCase {
  constructor(
    private readonly bookRepository: IBookRepository
  ) {}

  async execute(dto: ListBooksDTO): Promise<ListBooksResult> {
    try {
      // 1. Validar datos de entrada
      if (!dto.userId) {
        throw new Error('Usuario no autenticado');
      }

      // 2. Obtener libros del repositorio
      let books = await this.bookRepository.findByUserId(dto.userId);

      // 3. Aplicar filtros si existen
      if (dto.filter) {
        books = this.applyFilters(books, dto.filter);
      }

      // 4. Aplicar ordenamiento si existe
      if (dto.sort) {
        books = this.applySorting(books, dto.sort);
      }

      return {
        success: true,
        books,
        total: books.length,
        message: `${books.length} libro(s) encontrado(s)`
      };

    } catch (error: any) {
      console.error('❌ Error en ListBooksUseCase:', error);
      throw new Error(error.message || 'Error al listar libros');
    }
  }

  private applyFilters(
    books: Book[], 
    filter: ListBooksDTO['filter']
  ): Book[] {
    return books.filter(book => {
      // Filtro por término de búsqueda
      if (filter?.searchTerm) {
        const term = filter.searchTerm.toLowerCase();
        const matchTitle = book.metadata.titulo.toLowerCase().includes(term);
        const matchAuthor = book.metadata.autores.some(a => 
          a.toLowerCase().includes(term)
        );
        const matchDescription = book.metadata.descripcion.toLowerCase().includes(term);
        
        if (!matchTitle && !matchAuthor && !matchDescription) {
          return false;
        }
      }

      // Filtro por categoría
      if (filter?.category) {
        if (!book.metadata.selectedCategorias.includes(filter.category)) {
          return false;
        }
      }

      // Filtro por género
      if (filter?.genre) {
        if (!book.metadata.selectedGeneros.includes(filter.genre)) {
          return false;
        }
      }

      // Filtro por nivel
      if (filter?.level !== undefined) {
        if (book.metadata.selectedNivel !== filter.level) {
          return false;
        }
      }

      return true;
    });
  }

  private applySorting(
    books: Book[], 
    sort: ListBooksDTO['sort']
  ): Book[] {
    if (!sort) return books;

    return [...books].sort((a, b) => {
      let compareValue = 0;

      switch (sort.field) {
        case 'titulo':
          compareValue = a.metadata.titulo.localeCompare(b.metadata.titulo);
          break;
        case 'createdAt':
          compareValue = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'updatedAt':
          compareValue = a.updatedAt.getTime() - b.updatedAt.getTime();
          break;
      }

      return sort.order === 'asc' ? compareValue : -compareValue;
    });
  }
}