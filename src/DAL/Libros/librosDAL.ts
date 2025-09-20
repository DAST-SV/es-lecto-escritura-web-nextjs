import { supabaseAdmin } from "@/src/utils/supabase/admin";

export async function crearLibroCompleto(
  userId: string,
  title: string,
  background?: string | null,
  categoria?: number,
  genero?: number,
  descripcion? : string
) {
  // 1️⃣ Insertar libro y obtener IdLibro
  const { data: libro, error: libroError } = await supabaseAdmin
    .from("libros")
    .insert([
      {
        id_usuario: userId,
        id_tipo: 2,
        titulo: title,
        portada: background ?? null,
        descripcion : descripcion ?? null
      },
    ])
    .select("id_libro")
    .single();

  if (libroError) throw libroError; // Arroja si falla
  const libroId = libro.id_libro;

  // 2️⃣ Insertar categoría si existe
  if (categoria) {
    const { error: categoriaError } = await supabaseAdmin
      .from("libro_categorias")
      .insert([
        {
          id_libro: libroId,
          id_categoria: categoria,
        },
      ])
      .select()
      .single();

    if (categoriaError) throw categoriaError; // Arroja si falla
  }

  // 3️⃣ Insertar género si existe
  if (genero) {
    const { error: generoError } = await supabaseAdmin
      .from("libro_generos")
      .insert([
        {
          id_libro: libroId,
          id_genero: genero,
        },
      ])
      .select()
      .single();

    if (generoError) throw generoError; // Arroja si falla
  }

  return libroId;
}
