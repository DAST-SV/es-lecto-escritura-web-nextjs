import { supabaseAdmin } from "@/src/utils/supabase/admin";

/**
 * Procesa y vincula autores a un libro
 * - Crea un nuevo registro de autor para cada nombre (aunque ya exista uno con el mismo nombre)
 * - Vincula los autores creados al libro
 */
async function procesarAutores(libroId: string, autores: string[]) {
  if (!autores || autores.length === 0) return;

  const autoresIds: string[] = [];

  for (const nombreAutor of autores) {
    const nombreLimpio = nombreAutor.trim();
    if (!nombreLimpio) continue;

    // 🆕 Crear siempre un nuevo autor (sin verificar si existe)
    const { data: nuevoAutor, error: errorAutor } = await supabaseAdmin
      .from("autores")
      .insert({ nombre: nombreLimpio })
      .select("id_autor")
      .single();

    if (errorAutor) {
      console.error(`Error creando autor "${nombreLimpio}":`, errorAutor);
      throw errorAutor;
    }

    autoresIds.push(nuevoAutor.id_autor);
  }

  // 🔗 Vincular autores al libro
  if (autoresIds.length > 0) {
    const vinculaciones = autoresIds.map((idAutor) => ({
      id_libro: libroId,
      id_autor: idAutor,
    }));

    const { error: errorVinculo } = await supabaseAdmin
      .from("libros_autores")
      .insert(vinculaciones);

    if (errorVinculo) throw errorVinculo;
  }
}
/**
 * Procesa y vincula personajes a un libro
 * - Crea un nuevo registro de personaje para cada nombre
 * - Vincula los personajes creados al libro
 */
async function procesarPersonajes(libroId: string, personajes: string[]) {
  if (!personajes || personajes.length === 0) return;

  const personajesIds: string[] = [];

  for (const nombrePersonaje of personajes) {
    const nombreLimpio = nombrePersonaje.trim();
    if (!nombreLimpio) continue;

    // 🆕 Crear siempre un nuevo personaje
    const { data: nuevoPersonaje, error: errorPersonaje } = await supabaseAdmin
      .from("personajes")
      .insert({ nombre: nombreLimpio })
      .select("id_personaje")
      .single();

    if (errorPersonaje) {
      console.error(`Error creando personaje "${nombreLimpio}":`, errorPersonaje);
      throw errorPersonaje;
    }

    personajesIds.push(nuevoPersonaje.id_personaje);
  }

  // 🔗 Vincular personajes al libro
  if (personajesIds.length > 0) {
    const vinculaciones = personajesIds.map((idPersonaje) => ({
      id_libro: libroId,
      id_personaje: idPersonaje,
    }));

    const { error: errorVinculo } = await supabaseAdmin
      .from("libros_personajes")
      .insert(vinculaciones);

    if (errorVinculo) throw errorVinculo;
  }
}
/**
 * Crea un libro completo con todas sus relaciones
 */
export async function crearLibroCompleto(
  userId: string,
  title: string,
  nivel: number,
  autores: string[], // 🔥 Ahora recibe array de autores
  personajes?: string[], // 🔥 Ahora recibe array de autores
  categoria?: number[],
  genero?: number[],
  descripcion?: string,
  etiquetas?: number[],
  portada?: string,
  valores?: number[]
) {
  // 1️⃣ Insertar libro (sin campo 'autor')
  const { data: libro, error: libroError } = await supabaseAdmin
    .from("libros")
    .insert([
      {
        id_usuario: userId,
        id_tipo: 2,
        titulo: title,
        portada: portada ?? null,
        descripcion: descripcion ?? null,
        // ❌ YA NO: autor: autor,
        id_nivel: nivel,
      },
    ])
    .select("id_libro")
    .single();

  if (libroError) throw libroError;
  const libroId = libro.id_libro;

  // 2️⃣ Procesar y vincular autores
  await procesarAutores(libroId, autores);
  // 2️⃣ Procesar y vincular autores
  if(personajes)
  await procesarPersonajes(libroId, personajes);

  // 3️⃣ Insertar categorías si existen
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

  // 4️⃣ Insertar géneros si existen
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

  // 5️⃣ Insertar etiquetas si existen
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

  // 6️⃣ Insertar valores si existen
  if (valores?.length) {
    const { error: valoresError } = await supabaseAdmin
      .from("libro_valores")
      .insert(
        valores.map((id_valor) => ({
          id_libro: libroId,
          id_valor,
        }))
      );

    if (valoresError) throw valoresError;
  }

  return libroId;
}

