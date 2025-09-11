// src/DAL/librosDAL.ts
import { supabaseAdmin } from "@/src/utils/supabase/admin";

/**
 * Borra un libro, sus páginas y opcionalmente las imágenes del Storage.
 * @param LibroId - Id del libro a borrar
 * @param imagenes - Rutas de imágenes a eliminar del bucket (opcional)
 */
export async function borrarLibroCompleto(LibroId: string, imagenes: string[] = []) {
  // 1️⃣ Borrar páginas (opcional, por cascada si FK tiene ON DELETE CASCADE)
  await supabaseAdmin.from("PaginasLibro").delete().eq("IdLibro", LibroId);

  // 2️⃣ Borrar libro
  await supabaseAdmin.from("LibrosUsuario").delete().eq("IdLibro", LibroId);

  // 3️⃣ Borrar imágenes del bucket
  if (imagenes.length > 0) {
    try {
      await supabaseAdmin.storage.from("ImgLibros").remove(imagenes);
    } catch (err) {
      console.error("❌ Error borrando imágenes del bucket:", err);
    }
  }

  return true;
}
