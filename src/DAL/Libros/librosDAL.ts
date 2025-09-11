import { supabaseAdmin } from "@/src/utils/supabase/admin";

export async function crearLibroCompleto(
  userId: string,
  title: string,
) {
  // 1️⃣ Insertar libro y obtener IdLibro
  const { data: libro, error: libroError } = await supabaseAdmin
    .from("librosusuario")
    .insert([{ idusuario: userId, titulo: title }])
    .select("idlibro")
    .single();
  if (libroError) throw libroError;
  const libroId = libro.idlibro;

  return libroId;
}