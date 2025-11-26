/**
 * UBICACIÓN: src/infrastructure/dto/BookDTO.ts
 * DTOs para libros en Supabase
 */

import { PageDTO } from './PageDTO';

/**
 * DTO que representa un libro en la BD
 */
export interface BookDTO {
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
 * DTO para crear un libro nuevo
 */
export interface CreateBookDTO {
  userId: string;
  title: string;
  nivel: number;
  autores: string[];
  personajes?: string[];
  categoria?: number[];
  genero?: number[];
  descripcion?: string;
  etiquetas?: number[];
  portada?: string;
  valores?: number[];
}

/**
 * DTO para actualizar un libro existente
 */
export interface UpdateBookDTO {
  idLibro: string;
  titulo?: string;
  descripcion?: string;
  portada?: string;
  nivel?: number;
  autores?: string[];
  personajes?: string[];
  categoria?: number[];
  genero?: number[];
  etiquetas?: number[];
  valores?: number[];
}

/**
 * DTO completo con metadata y páginas
 */
export interface BookCompleteDTO {
  id_libro: string;
  titulo: string;
  descripcion: string;
  portada: string | null;
  autores: string[];
  personajes: string[];
  categorias: string[];
  generos: string[];
  valores: string[];
  etiquetas: string[];
  nivel: string | null;
  paginas: PageDTO[];
  fecha_creacion: string;
}