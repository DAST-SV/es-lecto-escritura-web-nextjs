// src/DAL/Libros/deleteBook.ts
import { createClient } from '@/src/utils/supabase/client';
import { removeFolder } from '@/src/utils/supabase/storageService';

/**
 * Elimina un libro completamente: BD + páginas + archivos en Supabase
 * @param idUsuario ID del usuario dueño del libro
 * @param idLibro ID del libro a eliminar
 */
export const deleteBook = async (idUsuario: string, idLibro: string) => {
  const supabase = await createClient();

  try {
    // ------------------------------
    // 1️⃣ Eliminar archivos en Supabase
    // ------------------------------
    const folderPath = `${idUsuario}/${idLibro}`;
    const result = await removeFolder('ImgLibros', folderPath);
    console.log(`Archivos eliminados en Supabase: ${result.removed}`);

    // ------------------------------
    // 2️⃣ Eliminar páginas relacionadas en la BD
    // ------------------------------
    const { error: pagesError } = await supabase
      .from('paginaslibro')
      .delete()
      .eq('idlibro', idLibro);

    if (pagesError) throw pagesError;

    // ------------------------------
    // 3️⃣ Eliminar libro en la BD
    // ------------------------------
    const { error: libroError } = await supabase
      .from('librosusuario')
      .delete()
      .match({ idlibro: idLibro, idusuario: idUsuario })


    if (libroError) throw libroError;

    return { success: true, message: 'Libro eliminado correctamente' };

  } catch (error) {
    console.error('❌ Error eliminando libro:', error);
    throw new Error('No se pudo eliminar el libro');
  }
};
