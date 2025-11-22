/**
 * UBICACIÓN: src/infrastructure/di/container.ts
 * 
 * Contenedor de Inyección de Dependencias
 * Gestiona la creación y reutilización de instancias
 */

import { IBookRepository } from '../../core/domain/repositories/IBookRepository';
import { IStorageService } from '../../core/application/ports/IStorageService';
import { SupabaseBookRepository } from '../repositories/SupabaseBookRepository';
import { SupabaseStorageService } from '../services/SupabaseStorageService';
import { SaveBookUseCase } from '../../core/application/use-cases/book/SaveBook.usecase';
import { LoadBookUseCase } from '../../core/application/use-cases/book/LoadBook.usecase';

/**
 * Contenedor de Inyección de Dependencias (Singleton)
 * Proporciona instancias únicas de servicios y repositorios
 */
export class DIContainer {
  private static instance: DIContainer;
  
  private bookRepository?: IBookRepository;
  private storageService?: IStorageService;

  private constructor() {}

  /**
   * Obtiene la instancia única del contenedor
   */
  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  /**
   * Obtiene el repositorio de libros
   */
  getBookRepository(): IBookRepository {
    if (!this.bookRepository) {
      this.bookRepository = new SupabaseBookRepository();
    }
    return this.bookRepository;
  }

  /**
   * Obtiene el servicio de storage
   */
  getStorageService(): IStorageService {
    if (!this.storageService) {
      this.storageService = new SupabaseStorageService();
    }
    return this.storageService;
  }

  /**
   * Crea una nueva instancia del caso de uso SaveBook
   */
  getSaveBookUseCase(): SaveBookUseCase {
    return new SaveBookUseCase(
      this.getBookRepository(),
      this.getStorageService()
    );
  }

  /**
   * Crea una nueva instancia del caso de uso LoadBook
   */
  getLoadBookUseCase(): LoadBookUseCase {
    return new LoadBookUseCase(
      this.getBookRepository()
    );
  }

  /**
   * Reemplaza el repositorio de libros (útil para testing)
   */
  setBookRepository(repository: IBookRepository): void {
    this.bookRepository = repository;
  }

  /**
   * Reemplaza el servicio de storage (útil para testing)
   */
  setStorageService(service: IStorageService): void {
    this.storageService = service;
  }

  /**
   * Limpia todas las instancias (útil para testing)
   */
  reset(): void {
    this.bookRepository = undefined;
    this.storageService = undefined;
  }
}

// Exportar instancia única para uso en la aplicación
export const container = DIContainer.getInstance();