import { supabaseAdmin } from "@/src/utils/supabase/admin";

export async function crearLibroCompleto(
  userId: string,
  title: string,
  background?: string | null // 👈 nuevo parámetro opcional
) {
  // 1️⃣ Insertar libro y obtener IdLibro
  const { data: libro, error: libroError } = await supabaseAdmin
    .from("libros")
    .insert([
      {
        id_usuario: userId,
        titulo: title,
        portada: background ?? null, // 👈 guardamos si viene, sino null
      },
    ])
    .select("id_libro")
    .single();

  if (libroError) throw libroError;
  const libroId = libro.id_libro;

  return libroId;
}
