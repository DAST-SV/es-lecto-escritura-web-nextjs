/**
 * UBICACIÓN: src/infrastructure/mappers/BookMapper.ts
 * 
 * Mapper para convertir entre diferentes formatos de Book
 */

import { Book, BookMetadata } from '../../core/domain/entities/Book.entity';
import { Page } from '../../core/domain/entities/Page.entity';

/**
 * Formato de base de datos
 */
export interface BookDTO {
  id_libro: string;
  id_usuario: string;
  titulo: string;
  descripcion: string;
  portada: string | null | File;
  autores: string[];
  personajes: string[];
  paginas: any[];
  categorias: (number | string)[];
  generos: (number | string)[];
  etiquetas: (number | string)[];
  valores: (number | string)[];
  nivel: number | null;
  fecha_creacion: string | Date;
  fecha_actualizacion: string | Date;
}

/**
 * Mapper de Book
 */
export class BookMapper {
  /**
   * Convierte de entidad de dominio a DTO de base de datos
   */
  static toDTO(book: Book): BookDTO {
    return {
      id_libro: book.id || '',
      id_usuario: book.userId,
      titulo: book.metadata.titulo,
      descripcion: book.metadata.descripcion,
      portada: book.metadata.portada || book.metadata.portadaUrl || null,
      autores: book.metadata.autores,
      personajes: book.metadata.personajes,
      paginas: book.pages.map(p => p.toLegacyFormat()),
      categorias: book.metadata.selectedCategorias,
      generos: book.metadata.selectedGeneros,
      etiquetas: book.metadata.selectedEtiquetas,
      valores: book.metadata.selectedValores,
      nivel: book.metadata.selectedNivel,
      fecha_creacion: book.createdAt,
      fecha_actualizacion: book.updatedAt
    };
  }

  /**
   * Convierte de DTO de base de datos a entidad de dominio
   */
  static toDomain(dto: BookDTO): Book {
    const pages = (dto.paginas || []).map((p: any) => Page.fromLegacyFormat(p));

    const metadata: BookMetadata = {
      titulo: dto.titulo || '',
      autores: dto.autores || [],
      personajes: dto.personajes || [],
      descripcion: dto.descripcion || '',
      portada: dto.portada,
      portadaUrl: typeof dto.portada === 'string' ? dto.portada : null,
      selectedCategorias: dto.categorias || [],
      selectedGeneros: dto.generos || [],
      selectedEtiquetas: dto.etiquetas || [],
      selectedValores: dto.valores || [],
      selectedNivel: dto.nivel,
    };

    return new Book(
      dto.id_libro,
      metadata,
      pages,
      dto.id_usuario,
      new Date(dto.fecha_creacion),
      new Date(dto.fecha_actualizacion)
    );
  }

  /**
   * Convierte un array de DTOs a un array de entidades
   */
  static toDomainList(dtos: BookDTO[]): Book[] {
    return dtos.map(dto => this.toDomain(dto));
  }

  /**
   * Convierte un array de entidades a un array de DTOs
   */
  static toDTOList(books: Book[]): BookDTO[] {
    return books.map(book => this.toDTO(book));
  }
}