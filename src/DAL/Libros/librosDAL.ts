import { supabaseAdmin } from "@/src/utils/supabase/admin";

export async function crearLibroCompleto(
  userId: string,
  title: string,
  nivel : number,
  autor: string,
  categoria?: number[],
  genero?: number[],
  descripcion?: string,
  etiquetas?: number[],
  portada?: string
) {
  // 1️⃣ Insertar libro y obtener IdLibro
  const { data: libro, error: libroError } = await supabaseAdmin
    .from("libros")
    .insert([
      {
        id_usuario: userId,
        id_tipo: 2,
        titulo: title,
        portada: portada ?? null,
        descripcion: descripcion ?? null,
        autor: autor,
        id_nivel : nivel
      },
    ])
    .select("id_libro")
    .single();

  if (libroError) throw libroError; // Arroja si falla
  const libroId = libro.id_libro;

  // 2️⃣ Insertar categorías si existen
  if (categoria?.length) {
    const { error: categoriaError } = await supabaseAdmin
      .from("libro_categorias")
      .insert(
        categoria.map((id_categoria) => ({
          id_libro: libroId,
          id_categoria,
        }))
      );

    if (categoriaError) throw categoriaError;
  }

  // 3️⃣ Insertar géneros si existen
  if (genero?.length) {
    const { error: generoError } = await supabaseAdmin
      .from("libro_generos")
      .insert(
        genero.map((id_genero) => ({
          id_libro: libroId,
          id_genero,
        }))
      );

    if (generoError) throw generoError;
  }

  // 4️⃣ Insertar etiquetas si existen
  if (etiquetas?.length) {
    const { error: etiquetasError } = await supabaseAdmin
      .from("libro_etiquetas")
      .insert(
        etiquetas.map((id_etiqueta) => ({
          id_libro: libroId,
          id_etiqueta,
        }))
      );

    if (etiquetasError) throw etiquetasError;
  }

  return libroId;
}
