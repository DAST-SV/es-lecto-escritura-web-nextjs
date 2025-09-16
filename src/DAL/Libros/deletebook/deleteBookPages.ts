// src/DAL/Libros/deleteBookPages.ts
import { createClient } from '@/src/utils/supabase/client';

/**
 * Elimina todas las páginas asociadas a un libro
 * @param idLibro ID del libro
 */
export const deleteBookPages = async (idLibro: string) => {
  const supabase = await createClient();

  const { error } = await supabase
    .from('paginaslibro')
    .delete()
    .eq('idlibro', idLibro);

  if (error) {
    console.error('❌ Error eliminando páginas del libro:', error);
    throw new Error('No se pudieron eliminar las páginas');
  }

  console.log(`Páginas eliminadas del libro ${idLibro}`);
};
