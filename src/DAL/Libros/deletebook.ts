// src/DAL/Libros/deleteBook.ts
import { deleteBookFiles } from '@/src/DAL/Libros/deletebook/deleteBookFiles';
import { deleteBookPages } from '@/src/DAL/Libros/deletebook/deleteBookPages';
import { deleteBookRecord } from '@/src/DAL/Libros/deletebook/deleteBookRecord';

/**
 * Elimina un libro completamente: archivos en Supabase + páginas + registro en BD
 * @param idUsuario ID del usuario dueño del libro
 * @param idLibro ID del libro a eliminar
 */
export const deleteBook = async (idUsuario: string, idLibro: string) => {
  try {
    // 1️⃣ Eliminar archivos en Supabase
    const resultFiles = await deleteBookFiles(idUsuario, idLibro);

    // 2️⃣ Eliminar páginas en la BD
    await deleteBookPages(idLibro);

    // 3️⃣ Eliminar registro del libro
    await deleteBookRecord(idUsuario, idLibro);

    console.log(`✅ Libro ${idLibro} eliminado completamente`);
    return { success: true, removedFiles: resultFiles.removed };
  } catch (error) {
    console.error('❌ Error eliminando libro completo:', error);
    throw new Error('No se pudo eliminar el libro');
  }
};
