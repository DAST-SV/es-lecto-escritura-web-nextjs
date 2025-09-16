// src/DAL/Libros/deleteBookFiles.ts
import { createClient } from '@/src/utils/supabase/client';
import { removeFolder } from '@/src/utils/supabase/storageService';

/**
 * Elimina todos los archivos de un libro en Supabase Storage
 * @param idUsuario ID del usuario
 * @param idLibro ID del libro
 * @returns Cantidad de archivos eliminados
 */
export const deleteBookFiles = async (idUsuario: string, idLibro: string) => {
  const supabase = await createClient();

  const folderPath = `${idUsuario}/${idLibro}`;
  const result = await removeFolder('ImgLibros', folderPath);

  console.log(`Archivos eliminados en Supabase: ${result.removed}`);
  return result;
};
