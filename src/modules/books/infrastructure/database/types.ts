/**
 * UBICACIÓN: src/modules/books/infrastructure/database/types.ts
 * Tipos que reflejan exactamente la estructura de PostgreSQL
 */

/**
 * Tabla: libros
 */
export interface DBLibro {
  id_libro: string;
  id_usuario: string;
  id_tipo: number;
  id_nivel: number;
  titulo: string;
  descripcion: string | null;
  portada: string | null;
  fecha_creacion: string;
}

/**
 * Tabla: paginas_libro
 */
export interface DBPagina {
  id_pagina: string;
  id_libro: string;
  numero_pagina: number;
  layout: string;
  animation: string | null;
  title: string | null;
  text: string | null;
  image: string | null;
  audio: string | null;
  interactive_game: string | null;
  items: string[] | null;
  background: string | null;
  border: string | null;
}

/**
 * DTOs para crear libro
 */
export interface CreateBookDTO {
  userId: string;
  titulo: string;
  nivel: number;
  autores: string[];
  personajes?: string[];
  categorias?: number[];
  generos?: number[];
  descripcion?: string;
  etiquetas?: number[];
  portada?: string;
  valores?: number[];
}

/**
 * DTOs para actualizar libro
 */
export interface UpdateBookDTO {
  idLibro: string;
  titulo?: string;
  descripcion?: string;
  portada?: string;
  nivel?: number;
  autores?: string[];
  personajes?: string[];
  categorias?: number[];
  generos?: number[];
  etiquetas?: number[];
  valores?: number[];
}

/**
 * DTO para insertar páginas
 */
export interface InsertPageDTO {
  id_libro: string;
  numero_pagina: number;
  layout: string;
  animation?: string | null;
  title?: string | null;
  text?: string | null;
  image?: string | null;
  audio?: string | null;
  interactive_game?: string | null;
  items?: string[] | null;
  background?: string | null;
  border?: string | null;
}