/**
 * UBICACIÓN: src/core/domain/entities/Book.entity.ts
 */

import { Page } from './Page.entity';
import { EntityValidationError } from '../errors/DomainError';

export interface BookMetadata {
  titulo: string;
  autores: string[];
  personajes: string[];
  descripcion: string;
  portada: File | string | null;
  portadaUrl?: string | null;
  selectedCategorias: (number | string)[];
  selectedGeneros: (number | string)[];
  selectedEtiquetas: (number | string)[];
  selectedValores: (number | string)[];
  selectedNivel: number | null;
  
  // NUEVO: Campos para la Ficha Literaria (tarjeta pública)
  cardBackgroundImage?: File | null;
  cardBackgroundUrl?: string | null;
}

export class Book {
  constructor(
    public readonly id: string | null,
    public readonly metadata: BookMetadata,
    public readonly pages: Page[],
    public readonly userId: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  validate(): void {
    const errors: string[] = [];

    if (!this.metadata.titulo || this.metadata.titulo.trim() === '') {
      errors.push('El título es obligatorio');
    }

    if (!this.metadata.autores || this.metadata.autores.length === 0) {
      errors.push('Debe haber al menos un autor');
    }

    if (!this.metadata.descripcion || this.metadata.descripcion.trim() === '') {
      errors.push('La descripción es obligatoria');
    }

    if (!this.metadata.selectedCategorias || this.metadata.selectedCategorias.length === 0) {
      errors.push('Debe seleccionar al menos una categoría');
    }

    if (!this.metadata.selectedGeneros || this.metadata.selectedGeneros.length === 0) {
      errors.push('Debe seleccionar al menos un género');
    }

    if (!this.metadata.portada && !this.metadata.portadaUrl) {
      errors.push('Debe seleccionar una portada');
    }

    if (this.pages.length === 0) {
      errors.push('El libro debe tener al menos una página');
    }

    if (errors.length > 0) {
      throw new EntityValidationError('Book', errors);
    }
  }

  isComplete(): boolean {
    try {
      this.validate();
      return true;
    } catch {
      return false;
    }
  }

  clone(): Book {
    return new Book(
      null,
      { ...this.metadata, portada: null },
      this.pages.map(p => p.clone()),
      this.userId
    );
  }
}