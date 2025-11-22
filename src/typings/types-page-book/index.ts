// src/typings/types-page-book/index.ts
import { layoutRegistry } from "@/src/presentation/features/layouts/registry"; // ✅ NUEVO
import { backgrounds } from "./backgrounds"; 
import { borders } from "./borders"

export type LayoutType = keyof typeof layoutRegistry; // ✅ CORREGIDO
export type borderstype = keyof typeof borders;
export type backgroundstype = keyof typeof backgrounds;

// ⭐ NUEVO: Tipo para posición de imagen
export type ImagePosition = 
  | 'top-left' 
  | 'top-center' 
  | 'top-right'
  | 'center-left' 
  | 'center' 
  | 'center-right'
  | 'bottom-left' 
  | 'bottom-center' 
  | 'bottom-right'
  | 'full';

////
// Este tipo se usa para la construcción del JSON para visualizar el libro
////
export interface Page {
  layout: LayoutType;
  animation?: string;
  title?: string;
  text?: string;
  image?: string;
  imagePosition?: ImagePosition; // ⭐ NUEVO
  audio?: string;
  interactiveGame?: string;
  items?: string[];
  background?: backgroundstype | string; 
  border?: borderstype;
}

////
// Este tipo se usa para la creación y editado de los libros
////
export interface page {
  id: string;
  layout: string;
  title?: string;
  text?: string;
  image?: string | null;         // URL para mostrar en la UI
  file?: Blob | File | null;     // Archivo real para subir
  imagePosition?: ImagePosition; // ⭐ NUEVO
  background?: string | null;    // color o URL para mostrar
  backgroundFile?: Blob | File | null; // Archivo real del background
}

export interface LibroUI {
  Json: string;
  src: string;
  caption: string;
  description?: string;
}

// Tipo del libro completo
export interface Story {
  pages: Page[];           // Array de páginas
}