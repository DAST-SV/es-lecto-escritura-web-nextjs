/**
 * UBICACIÓN: src/infrastructure/services/bookService.ts
 */

import toast from "react-hot-toast";
import { container } from '../di/container';
import { Book, BookMetadata as DomainBookMetadata } from '../../core/domain/entities/Book.entity';
import { Page } from '../../core/domain/entities/Page.entity';
import type { page } from '@/src/typings/types-page-book/index';

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
    // Obtener el use case desde el contenedor DI
    const saveBookUseCase = container.getSaveBookUseCase();
    
    // Obtener userId
    const { getUserId } = await import('@/src/utils/supabase/utilsClient');
    const userId = await getUserId();
    
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }

    // Convertir páginas a entidades de dominio
    const domainPages = pages.map(p => Page.fromLegacyFormat(p));
    
    // Crear entidad Book
    const book = new Book(
      IdLibro || null,
      toDomainMetadata(metadata),
      domainPages,
      userId
    );

    // Ejecutar use case
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