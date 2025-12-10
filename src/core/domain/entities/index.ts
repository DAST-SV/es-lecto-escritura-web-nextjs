import { BookMetadata } from '../types';

export class Book {
  constructor(
    public readonly id: string | null,
    public readonly metadata: BookMetadata,
    public readonly userId: string,
    public readonly pdfUrl: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  validate(): string[] {
    const errors: string[] = [];
    if (!this.metadata.titulo?.trim()) errors.push('El título es obligatorio');
    if (this.metadata.autores.length === 0) errors.push('Debe haber al menos un autor');
    if (!this.metadata.descripcion?.trim()) errors.push('La descripción es obligatoria');
    if (this.metadata.selectedCategorias.length === 0) errors.push('Debe seleccionar al menos una categoría');
    if (this.metadata.selectedGeneros.length === 0) errors.push('Debe seleccionar al menos un género');
    const hasImage = this.metadata.portada || this.metadata.portadaUrl || this.metadata.cardBackgroundImage || this.metadata.cardBackgroundUrl;
    if (!hasImage) errors.push('Debe seleccionar una imagen');
    if (!this.pdfUrl) errors.push('El archivo PDF es obligatorio');
    return errors;
  }

  isValid(): boolean {
    return this.validate().length === 0;
  }

  clone(): Book {
    return new Book(null, { ...this.metadata, portada: null, cardBackgroundImage: null }, this.userId, this.pdfUrl);
  }
}

export type { BookMetadata } from '../types';