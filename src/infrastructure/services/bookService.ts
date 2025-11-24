/**
 * UBICACIÓN: src/infrastructure/services/bookService.ts
 * ACTUALIZADO: Interface BookMetadata con campos de Ficha Literaria
 */

import toast from "react-hot-toast";
import { container } from '../di/container';
import { Book, BookMetadata as DomainBookMetadata } from '../../core/domain/entities/Book.entity';
import { Page } from '../../core/domain/entities/Page.entity';
import type { page } from '@/src/typings/types-page-book/index';

// Interface actualizada con campos de Ficha Literaria
export interface BookMetadata {
  selectedCategorias: (number | string)[];
  selectedGeneros: (number | string)[];
  selectedEtiquetas: (number | string)[];
  selectedValores: (number | string)[];
  selectedNivel: number | null;
  autores: string[];
  personajes: string[];
  descripcion: string;
  titulo: string;
  portada: File | null;
  portadaUrl?: string | null;

  // NUEVO: Campos para la Ficha Literaria
  cardBackgroundImage?: File | null;
  cardBackgroundUrl?: string | null;
}

/**
 * Convierte metadata de UI a dominio
 */
function toDomainMetadata(uiMetadata: BookMetadata): DomainBookMetadata {
  return {
    titulo: uiMetadata.titulo,
    autores: uiMetadata.autores,
    personajes: uiMetadata.personajes,
    descripcion: uiMetadata.descripcion,
    portada: uiMetadata.portada,
    portadaUrl: uiMetadata.portadaUrl,
    selectedCategorias: uiMetadata.selectedCategorias,
    selectedGeneros: uiMetadata.selectedGeneros,
    selectedEtiquetas: uiMetadata.selectedEtiquetas,
    selectedValores: uiMetadata.selectedValores,
    selectedNivel: uiMetadata.selectedNivel,
    // NUEVO: Pasar campos de ficha literaria
    cardBackgroundImage: uiMetadata.cardBackgroundImage,
    cardBackgroundUrl: uiMetadata.cardBackgroundUrl,
  };
}

/**
 * Función principal para guardar libro usando arquitectura limpia
 */
export async function saveBookJson(
  pages: page[],
  metadata: BookMetadata,
  IdLibro?: string
): Promise<void> {
  try {
    // ✅ Verificar que getUserId funcione
    const { getUserId } = await import('@/src/utils/supabase/utilsClient');
    const userId = await getUserId();

    // ✅ TEMPORAL: Ver el userId
    console.log('👤 userId obtenido:', userId);

    if (!userId) {
      throw new Error('Usuario no autenticado');
    }

    // ✅ TEMPORAL: Ver el metadata
    console.log('📋 metadata:', {
      titulo: metadata.titulo,
      autores: metadata.autores,
      descripcion: metadata.descripcion?.substring(0, 50)
    });

    const saveBookUseCase = container.getSaveBookUseCase();

    const domainPages = pages.map(p => Page.fromLegacyFormat(p));

    const book = new Book(
      IdLibro || null,
      toDomainMetadata(metadata),
      domainPages,
      userId
    );

    // ✅ TEMPORAL: Ver el book antes de ejecutar
    console.log('📚 Book a guardar:', {
      userId: book.userId,
      titulo: book.metadata.titulo,
      id: book.id
    });

    const result = await saveBookUseCase.execute({
      book,
      userId,
      bookId: IdLibro
    });

    if (result.success) {
      toast.success(result.message);
    } else {
      throw new Error(result.message);
    }

  } catch (error: any) {
    console.error('❌ Error guardando libro:', error.message);
    toast.error('❌ Error al guardar el libro');
    throw error;
  }
}