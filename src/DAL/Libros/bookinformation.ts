import { createClient } from "@/src/utils/supabase/client";
import { Libro } from "@/src/typings/Libro";

export async function getBooksByUserId(idUsuario: string): Promise<Libro[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("libros")
    .select("*")
    .eq("id_usuario", idUsuario)
    .order("fecha_creacion", { ascending: true });

  if (error) {
    console.error("❌ Error obteniendo libros del usuario:", error);
    throw error;
  }

  return data || [];
}

// Interfaz para el libro con metadata completa
export interface LibroConMetadata {
  id_libro: string;
  id_usuario: string | null;
  id_tipo: number;
  titulo: string;
  descripcion: string | null;
  portada: string | null;
  fecha_creacion: string;
  autores: string[];
  personajes: string[];
  nivel?: number | null;
  categorias: Array<{ id_categoria: number; es_principal: boolean }>;
  generos: Array<{ id_genero: number }>;
  etiquetas: Array<{ id_etiqueta: number; es_principal: boolean }>;
  valores: Array<{ id_valor: number; es_principal: boolean }>;
}

/**
 * Obtiene un libro con toda su metadata (categorías, géneros, etiquetas, valores, autores, personajes)
 * @param idLibro - UUID del libro
 * @returns Libro con metadata completa o null si no existe
 */
export async function getBookWithMetadata(idLibro: string): Promise<LibroConMetadata | null> {
  const supabase = await createClient();

  try {
    // 1. Obtener datos básicos del libro
    const { data: libro, error: libroError } = await supabase
      .from("libros")
      .select("*")
      .eq("id_libro", idLibro)
      .single();

    if (libroError) {
      console.error("❌ Error obteniendo libro:", libroError);
      throw libroError;
    }

    if (!libro) {
      console.warn("⚠️ Libro no encontrado:", idLibro);
      return null;
    }

    // 2. Obtener categorías del libro
    const { data: categorias, error: categoriasError } = await supabase
      .from("libro_categorias")
      .select("id_categoria, es_principal")
      .eq("id_libro", idLibro);

    if (categoriasError) {
      console.error("❌ Error obteniendo categorías:", categoriasError);
    }

    // 3. Obtener géneros del libro
    const { data: generos, error: generosError } = await supabase
      .from("libro_generos")
      .select("id_genero")
      .eq("id_libro", idLibro);

    if (generosError) {
      console.error("❌ Error obteniendo géneros:", generosError);
    }

    // 4. Obtener etiquetas del libro
    const { data: etiquetas, error: etiquetasError } = await supabase
      .from("libro_etiquetas")
      .select("id_etiqueta, es_principal")
      .eq("id_libro", idLibro);

    if (etiquetasError) {
      console.error("❌ Error obteniendo etiquetas:", etiquetasError);
    }

    // 5. Obtener valores del libro
    const { data: valores, error: valoresError } = await supabase
      .from("libro_valores")
      .select("id_valor, es_principal")
      .eq("id_libro", idLibro);

    if (valoresError) {
      console.error("❌ Error obteniendo valores:", valoresError);
    }

    // 6. Obtener autores del libro (JOIN con tabla autores)
    const { data: autoresData, error: autoresError } = await supabase
      .from("libros_autores")
      .select("autores(nombre)")
      .eq("id_libro", idLibro);

    if (autoresError) {
      console.error("❌ Error obteniendo autores:", autoresError);
    }

    // 7. Obtener personajes del libro (JOIN con tabla personajes)
    const { data: personajesData, error: personajesError } = await supabase
      .from("libros_personajes")
      .select("personajes(nombre)")
      .eq("id_libro", idLibro);

    if (personajesError) {
      console.error("❌ Error obteniendo personajes:", personajesError);
    }

    // Extraer nombres de autores y personajes
    const autores = autoresData?.map((item: any) => item.autores?.nombre).filter(Boolean) || [];
    const personajes = personajesData?.map((item: any) => item.personajes?.nombre).filter(Boolean) || [];

    // 8. Construir y retornar objeto completo
    const libroCompleto: LibroConMetadata = {
      id_libro: libro.id_libro,
      id_usuario: libro.id_usuario,
      id_tipo: libro.id_tipo,
      titulo: libro.titulo,
      descripcion: libro.descripcion,
      portada: libro.portada,
      fecha_creacion: libro.fecha_creacion,
      nivel: libro.id_nivel || null,
      autores,
      personajes,
      categorias: categorias || [],
      generos: generos || [],
      etiquetas: etiquetas || [],
      valores: valores || [],
    };

    console.log("✅ Libro con metadata obtenido correctamente:", {
      id: libroCompleto.id_libro,
      titulo: libroCompleto.titulo,
      autoresCount: libroCompleto.autores.length,
      personajesCount: libroCompleto.personajes.length,
      categoriasCount: libroCompleto.categorias.length,
      generosCount: libroCompleto.generos.length,
      etiquetasCount: libroCompleto.etiquetas.length,
      valoresCount: libroCompleto.valores.length,
    });

    return libroCompleto;
  } catch (error) {
    console.error("❌ Error fatal en getBookWithMetadata:", error);
    throw error;
  }
}

// Versión optimizada con Promise.all para mejor rendimiento
export async function getBookWithMetadataOptimized(idLibro: string): Promise<LibroConMetadata | null> {
  const supabase = await createClient();

  try {
    // Ejecutar todas las queries en paralelo
    const [
      { data: libro, error: libroError },
      { data: categorias, error: categoriasError },
      { data: generos, error: generosError },
      { data: etiquetas, error: etiquetasError },
      { data: valores, error: valoresError },
      { data: autoresData, error: autoresError },
      { data: personajesData, error: personajesError }
    ] = await Promise.all([
      supabase.from("libros").select("*").eq("id_libro", idLibro).single(),
      supabase.from("libro_categorias").select("id_categoria, es_principal").eq("id_libro", idLibro),
      supabase.from("libro_generos").select("id_genero").eq("id_libro", idLibro),
      supabase.from("libro_etiquetas").select("id_etiqueta, es_principal").eq("id_libro", idLibro),
      supabase.from("libro_valores").select("id_valor, es_principal").eq("id_libro", idLibro),
      supabase.from("libros_autores").select("autores(nombre)").eq("id_libro", idLibro),
      supabase.from("libros_personajes").select("personajes(nombre)").eq("id_libro", idLibro)
    ]);

    // Manejar errores
    if (libroError) {
      console.error("❌ Error obteniendo libro:", libroError);
      throw libroError;
    }

    if (!libro) {
      console.warn("⚠️ Libro no encontrado:", idLibro);
      return null;
    }

    if (categoriasError) console.error("❌ Error obteniendo categorías:", categoriasError);
    if (generosError) console.error("❌ Error obteniendo géneros:", generosError);
    if (etiquetasError) console.error("❌ Error obteniendo etiquetas:", etiquetasError);
    if (valoresError) console.error("❌ Error obteniendo valores:", valoresError);
    if (autoresError) console.error("❌ Error obteniendo autores:", autoresError);
    if (personajesError) console.error("❌ Error obteniendo personajes:", personajesError);

    // Extraer nombres de autores y personajes
    const autores = autoresData?.map((item: any) => item.autores?.nombre).filter(Boolean) || [];
    const personajes = personajesData?.map((item: any) => item.personajes?.nombre).filter(Boolean) || [];

    // Construir objeto completo
    const libroCompleto: LibroConMetadata = {
      id_libro: libro.id_libro,
      id_usuario: libro.id_usuario,
      id_tipo: libro.id_tipo,
      titulo: libro.titulo,
      descripcion: libro.descripcion,
      portada: libro.portada,
      fecha_creacion: libro.fecha_creacion,
      nivel: libro.id_nivel || null,
      autores,
      personajes,
      categorias: categorias || [],
      generos: generos || [],
      etiquetas: etiquetas || [],
      valores: valores || [],
    };

    console.log("✅ Libro con metadata obtenido (optimizado):", {
      id: libroCompleto.id_libro,
      titulo: libroCompleto.titulo,
      autoresCount: libroCompleto.autores.length,
      personajesCount: libroCompleto.personajes.length,
    });

    return libroCompleto;
  } catch (error) {
    console.error("❌ Error fatal en getBookWithMetadataOptimized:", error);
    throw error;
  }
}