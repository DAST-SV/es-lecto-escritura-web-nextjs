/**
 * UBICACIÓN: src/infrastructure/mappers/BookMapper.ts
 * 
 * Mapper para convertir entre diferentes formatos de Book
 */

import { Book, BookMetadata } from '../../core/domain/entities/Book.entity';
import { Page } from '../../core/domain/entities/Page.entity';

/**
 * Mapper de Book
 */
export class BookMapper {
  /**
   * Convierte de entidad de dominio a DTO para el API
   */
  static toDTO(book: Book): any {
    // Usar imagen de fondo de ficha si no hay portada
    const portadaFinal = 
      book.metadata.portada || 
      book.metadata.portadaUrl || 
      book.metadata.cardBackgroundImage ||
      book.metadata.cardBackgroundUrl || 
      null;

    return {
      userId: book.userId,
      title: book.metadata.titulo,
      descripcion: book.metadata.descripcion,
      portada: portadaFinal,
      autores: book.metadata.autores,
      personajes: book.metadata.personajes,
      categoria: book.metadata.selectedCategorias,
      genero: book.metadata.selectedGeneros,
      etiquetas: book.metadata.selectedEtiquetas,
      valores: book.metadata.selectedValores,
      nivel: book.metadata.selectedNivel,
    };
  }

  /**
   * Convierte de DTO de base de datos a entidad de dominio
   */
  static toDomain(dto: any): Book {
    const pages = (dto.paginas || []).map((p: any) => Page.fromLegacyFormat(p));

    const metadata: BookMetadata = {
      titulo: dto.title || dto.titulo || '',
      autores: dto.autores || [],
      personajes: dto.personajes || [],
      descripcion: dto.descripcion || '',
      portada: dto.portada,
      portadaUrl: typeof dto.portada === 'string' ? dto.portada : null,
      selectedCategorias: dto.categoria || dto.categorias || [],
      selectedGeneros: dto.genero || dto.generos || [],
      selectedEtiquetas: dto.etiquetas || [],
      selectedValores: dto.valores || [],
      selectedNivel: dto.nivel,
    };

    return new Book(
      dto.id_libro || dto.id,
      metadata,
      pages,
      dto.userId || dto.id_usuario,
      new Date(dto.fecha_creacion || Date.now()),
      new Date(dto.fecha_actualizacion || Date.now())
    );
  }

  /**
   * Convierte un array de DTOs a un array de entidades
   */
  static toDomainList(dtos: any[]): Book[] {
    return dtos.map(dto => this.toDomain(dto));
  }

  /**
   * Convierte un array de entidades a un array de DTOs
   */
  static toDTOList(books: Book[]): any[] {
    return books.map(book => this.toDTO(book));
  }
}