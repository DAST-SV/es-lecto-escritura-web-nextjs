/**
 * UBICACIÓN: src/infrastructure/dto/PageDTO.ts
 * DTO para páginas en Supabase (refleja estructura de BD)
 */

export interface PageDTO {
  id_pagina?: string;
  id_libro?: string;
  numero_pagina?: number;
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

/**
 * DTO para crear/actualizar páginas (sin IDs)
 */
export interface CreatePageDTO {
  layout: string;
  animation?: string;
  title?: string;
  text?: string;
  image?: string;
  audio?: string;
  interactiveGame?: string;
  items?: any[];
  background?: string;
  border?: string;
}