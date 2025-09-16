// src/DAL/Libros/deleteBookRecord.ts
import { createClient } from '@/src/utils/supabase/client';

/**
 * Elimina el registro del libro en la BD
 * @param idUsuario ID del usuario
 * @param idLibro ID del libro
 */
export const deleteBookRecord = async (idUsuario: string, idLibro: string) => {
  const supabase = await createClient();

  const { error } = await supabase
    .from('librosusuario')
    .delete()
    .match({ idlibro: idLibro, idusuario: idUsuario });

  if (error) {
    console.error('❌ Error eliminando registro del libro:', error);
    throw new Error('No se pudo eliminar el libro');
  }

  console.log(`Registro del libro ${idLibro} eliminado`);
};
