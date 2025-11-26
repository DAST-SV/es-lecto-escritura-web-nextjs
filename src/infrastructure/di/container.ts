/**
 * UBICACIÓN: src/infrastructure/di/container.ts
 */

import { BookRepository } from '../repositories/books/BookRepository';
import { CreateBookUseCase } from '../../core/application/use-cases/books/CreateBook.usecase';
import { UpdateBookUseCase } from '../../core/application/use-cases/books/UpdateBook.usecase';
import { GetBookUseCase } from '../../core/application/use-cases/books/GetBook.usecase';
import { GetBooksByUserUseCase } from '../../core/application/use-cases/books/GetBooksByUser.usecase';
import { DeleteBookUseCase } from '../../core/application/use-cases/books/DeleteBook.usecase';

class Container {
  private static instance: Container;
  private bookRepository?: typeof BookRepository;

  private constructor() {
    this.initializeRepositories();
  }

  public static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  private initializeRepositories(): void {
    this.bookRepository = BookRepository;
  }

  public getBookRepository(): typeof BookRepository {
    if (!this.bookRepository) {
      throw new Error('BookRepository no está inicializado');
    }
    return this.bookRepository;
  }

  public getCreateBookUseCase() {
    return CreateBookUseCase;
  }

  public getUpdateBookUseCase() {
    return UpdateBookUseCase;
  }

  public getGetBookUseCase() {
    return GetBookUseCase;
  }

  public getGetBooksByUserUseCase() {
    return GetBooksByUserUseCase;
  }

  public getDeleteBookUseCase() {
    return DeleteBookUseCase;
  }
}

export const container = Container.getInstance();