/**
 * UBICACIÓN: src/modules/books/presentation/types.ts
 * Tipos para la UI - incluyen archivos para subir
 */

import { LayoutType, ImagePosition } from '../domain/types';

/**
 * Página en el editor (con archivos)
 */
export interface EditorPage {
  id: string;
  layout: LayoutType;
  title?: string;
  text?: string;
  
  // Imagen principal
  image?: string | null;           // URL preview
  imageFile?: File | Blob | null;  // Archivo para subir
  imagePosition?: ImagePosition;
  
  // Background
  background?: string | null;      // URL preview
  backgroundFile?: File | Blob | null; // Archivo para subir
  
  // Otros
  animation?: string;
  audio?: string;
  interactiveGame?: string;
  items?: string[];
  border?: string;
}

/**
 * Metadata en el editor (con archivos)
 */
export interface EditorMetadata {
  titulo: string;
  descripcion: string;
  autores: string[];
  personajes: string[];
  
  // Portada
  portadaUrl?: string | null;
  portadaFile?: File | null;
  
  // Card background
  cardBackgroundUrl?: string | null;
  cardBackgroundFile?: File | null;
  
  // Relaciones
  selectedCategorias: number[];
  selectedGeneros: number[];
  selectedEtiquetas: number[];
  selectedValores: number[];
  selectedNivel: number | null;
}

/**
 * Estado del editor
 */
export interface EditorState {
  pages: EditorPage[];
  metadata: EditorMetadata;
  isSaving: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}