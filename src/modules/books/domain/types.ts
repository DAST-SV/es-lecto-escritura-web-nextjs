/**
 * UBICACIÓN: src/modules/books/domain/types.ts
 * Tipos de dominio - representan conceptos del negocio
 */

export type LayoutType = 
  | 'default' 
  | 'titleOnly' 
  | 'imageOnly' 
  | 'textOnly' 
  | 'imageText'
  | 'textImage'
  | 'fullImage';

export type ImagePosition = 
  | 'top-left' | 'top-center' | 'top-right'
  | 'center-left' | 'center' | 'center-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right'
  | 'full';

/**
 * Página de libro (dominio)
 */
export interface Page {
  id?: string;
  layout: LayoutType;
  title?: string;
  text?: string;
  image?: string;
  imagePosition?: ImagePosition;
  background?: string;
  animation?: string;
  audio?: string;
  interactiveGame?: string;
  items?: string[];
  border?: string;
}

/**
 * Metadata de libro
 */
export interface BookMetadata {
  titulo: string;
  descripcion: string;
  autores: string[];
  personajes: string[];
  portada?: string;
  categorias: number[];
  generos: number[];
  etiquetas: number[];
  valores: number[];
  nivel: number;
}

/**
 * Libro completo
 */
export interface Book {
  id?: string;
  userId: string;
  metadata: BookMetadata;
  pages: Page[];
  createdAt?: Date;
  updatedAt?: Date;
}