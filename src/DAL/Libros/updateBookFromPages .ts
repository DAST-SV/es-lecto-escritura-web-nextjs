import { supabaseAdmin } from '@/src/utils/supabase/admin';
import type { Page } from '@/src/typings/types-page-book/index';

/**
 * Reemplaza los autores de un libro de forma inteligente
 * - Obtiene los autores actuales del libro
 * - Mantiene los autores que siguen en la nueva lista (reutiliza sus IDs)
 * - Crea nuevos autores para nombres que no existían
 * - Elimina solo las vinculaciones de autores que ya no están en la lista
 */
async function reemplazarAutores(libroId: string, autores: string[]) {
  if (!autores || autores.length === 0) return;

  // 1️⃣ Obtener autores actuales del libro con sus nombres
  const { data: autoresActuales, error: errorObtener } = await supabaseAdmin
    .from("libros_autores")
    .select(`
      id_autor,
      autores (
        nombre
      )
    `)
    .eq("id_libro", libroId);

  if (errorObtener) {
    console.error("Error obteniendo autores actuales:", errorObtener);
    throw errorObtener;
  }

  // 2️⃣ Crear mapa de autores actuales: nombre -> id_autor
  const autoresActualesMap = new Map<string, string>();
  const idsActuales = new Set<string>();
  
  (autoresActuales || []).forEach((item: any) => {
    const nombreActual = item.autores?.nombre?.toLowerCase().trim();
    if (nombreActual) {
      autoresActualesMap.set(nombreActual, item.id_autor);
      idsActuales.add(item.id_autor);
    }
  });

  // 3️⃣ Procesar nuevos autores
  const autoresIdsFinales: string[] = [];
  const autoresAMantener = new Set<string>();

  for (const nombreAutor of autores) {
    const nombreLimpio = nombreAutor.trim();
    if (!nombreLimpio) continue;

    const nombreNormalizado = nombreLimpio.toLowerCase();

    if (autoresActualesMap.has(nombreNormalizado)) {
      const idExistente = autoresActualesMap.get(nombreNormalizado)!;
      autoresIdsFinales.push(idExistente);
      autoresAMantener.add(idExistente);
    } else {
      const { data: nuevoAutor, error: errorAutor } = await supabaseAdmin
        .from("autores")
        .insert({ nombre: nombreLimpio })
        .select("id_autor")
        .single();

      if (errorAutor) {
        console.error(`Error creando autor "${nombreLimpio}":`, errorAutor);
        throw errorAutor;
      }

      autoresIdsFinales.push(nuevoAutor.id_autor);
    }
  }

  // 4️⃣ Eliminar autores que ya no deben estar
  const autoresAEliminar = Array.from(idsActuales).filter(
    (id) => !autoresAMantener.has(id)
  );

  if (autoresAEliminar.length > 0) {
    await supabaseAdmin
      .from("libros_autores")
      .delete()
      .eq("id_libro", libroId)
      .in("id_autor", autoresAEliminar);
  }

  // 5️⃣ Insertar únicamente los autores nuevos
  const autoresNuevos = autoresIdsFinales.filter(
    (id) => !idsActuales.has(id)
  );

  if (autoresNuevos.length > 0) {
    const vinculaciones = autoresNuevos.map((idAutor) => ({
      id_libro: libroId,
      id_autor: idAutor,
    }));

    const { error: errorVinculo } = await supabaseAdmin
      .from("libros_autores")
      .insert(vinculaciones);

    if (errorVinculo) throw errorVinculo;
  }

  // ❌ Eliminado: este bloque era incorrecto y duplicado
  // if (autoresIds.length > 0) { ... }

}


/**
 * Reemplaza los personajes de un libro de forma inteligente
 * - Obtiene los personajes actuales del libro
 * - Mantiene los personajes que siguen en la nueva lista (reutiliza sus IDs)
 * - Crea nuevos personajes para nombres que no existían
 * - Elimina solo las vinculaciones de personajes que ya no están en la lista
 */
async function reemplazarPersonajes(libroId: string, personajes: string[]) {
  if (!personajes || personajes.length === 0) return;

  // 1️⃣ Obtener personajes actuales del libro con sus nombres
  const { data: personajesActuales, error: errorObtener } = await supabaseAdmin
    .from("libros_personajes")
    .select(`
      id_personaje,
      personajes (
        nombre
      )
    `)
    .eq("id_libro", libroId);

  if (errorObtener) {
    console.error("Error obteniendo personajes actuales:", errorObtener);
    throw errorObtener;
  }

  // 2️⃣ Crear mapa de personajes actuales: nombre -> id_personaje
  const personajesActualesMap = new Map<string, string>();
  const idsActuales = new Set<string>();
  
  (personajesActuales || []).forEach((item: any) => {
    const nombreActual = item.personajes?.nombre?.toLowerCase().trim();
    if (nombreActual) {
      personajesActualesMap.set(nombreActual, item.id_personaje);
      idsActuales.add(item.id_personaje);
    }
  });

  // 3️⃣ Procesar nuevos personajes
  const personajesIdsFinales: string[] = [];
  const personajesAMantener = new Set<string>();

  for (const nombrePersonaje of personajes) {
    const nombreLimpio = nombrePersonaje.trim();
    if (!nombreLimpio) continue;

    const nombreNormalizado = nombreLimpio.toLowerCase();

    // ✅ Si el personaje ya existe en el libro, reutilizar su ID
    if (personajesActualesMap.has(nombreNormalizado)) {
      const idExistente = personajesActualesMap.get(nombreNormalizado)!;
      personajesIdsFinales.push(idExistente);
      personajesAMantener.add(idExistente);
    } else {
      // 🆕 Crear nuevo personaje
      const { data: nuevoPersonaje, error: errorPersonaje } = await supabaseAdmin
        .from("personajes")
        .insert({ nombre: nombreLimpio })
        .select("id_personaje")
        .single();

      if (errorPersonaje) {
        console.error(`Error creando personaje "${nombreLimpio}":`, errorPersonaje);
        throw errorPersonaje;
      }

      personajesIdsFinales.push(nuevoPersonaje.id_personaje);
    }
  }

  // 4️⃣ Eliminar solo las vinculaciones de personajes que YA NO están en la nueva lista
  const personajesAEliminar = Array.from(idsActuales).filter(
    (id) => !personajesAMantener.has(id)
  );

  if (personajesAEliminar.length > 0) {
    await supabaseAdmin
      .from("libros_personajes")
      .delete()
      .eq("id_libro", libroId)
      .in("id_personaje", personajesAEliminar);
  }

  // 5️⃣ Insertar solo los personajes nuevos (los existentes ya están vinculados)
  const personajesNuevos = personajesIdsFinales.filter(
    (id) => !idsActuales.has(id)
  );

  if (personajesNuevos.length > 0) {
    const vinculaciones = personajesNuevos.map((idPersonaje) => ({
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
 * Actualiza un libro y sus páginas.
 * - Modifica libros con título, portada y descripción (solo si tienen valor).
 * - Reemplaza relaciones: autores, categorías, géneros, etiquetas y valores.
 * - Reemplaza páginas según numero_pagina.
 */
export const updateBookFromPages = async (
  idLibro: string,
  pages: Page[],
  id_nivel: number,
  autores?: string[], // 🔥 Ahora recibe array de autores
  personajes?: string[], // 🔥 Ahora recibe array de autores
  etiquetas?: number[],
  categoria?: number[],
  genero?: number[],
  descripcion?: string,
  titulo?: string,
  portada?: string,
  valores?: number[]
) => {
  if (!idLibro) throw new Error('idLibro es requerido');
  if (!pages || pages.length === 0) throw new Error('pages no puede estar vacío');

  const supabase = supabaseAdmin;

  try {
    // ------------------------------
    // 1️⃣ Actualizar libro solo con campos existentes
    // ------------------------------
    const updateData: Record<string, any> = {};
    if (titulo != null) updateData.titulo = titulo;
    if (portada != null) updateData.portada = portada;
    if (descripcion != null) updateData.descripcion = descripcion;
    if (id_nivel != null) updateData.id_nivel = id_nivel;
    // ❌ YA NO: if (autor != null) updateData.autor = autor;

    if (Object.keys(updateData).length > 0) {
      const { error: libroError } = await supabase
        .from('libros')
        .update(updateData)
        .eq('id_libro', idLibro);

      if (libroError) throw libroError;
    }

    // ------------------------------
    // 2️⃣ Reemplazar autores
    // ------------------------------
    if (autores?.length) {
      await reemplazarAutores(idLibro, autores);
    }
    if (personajes?.length) {
      await reemplazarPersonajes(idLibro, personajes);
    }

    // ------------------------------
    // 3️⃣ Reemplazar categorías
    // ------------------------------
    if (categoria?.length) {
      await supabase.from('libro_categorias').delete().eq('id_libro', idLibro);
      const { error: categoriaError } = await supabase
        .from('libro_categorias')
        .insert(categoria.map((id_categoria) => ({ id_libro: idLibro, id_categoria })));
      if (categoriaError) throw categoriaError;
    }

    // ------------------------------
    // 4️⃣ Reemplazar géneros
    // ------------------------------
    if (genero?.length) {
      await supabase.from('libro_generos').delete().eq('id_libro', idLibro);
      const { error: generoError } = await supabase
        .from('libro_generos')
        .insert(genero.map((id_genero) => ({ id_libro: idLibro, id_genero })));
      if (generoError) throw generoError;
    }

    // ------------------------------
    // 5️⃣ Reemplazar etiquetas
    // ------------------------------
    if (etiquetas?.length) {
      await supabase.from('libro_etiquetas').delete().eq('id_libro', idLibro);
      const { error: etiquetasError } = await supabase
        .from('libro_etiquetas')
        .insert(etiquetas.map((id_etiqueta) => ({ id_libro: idLibro, id_etiqueta })));
      if (etiquetasError) throw etiquetasError;
    }

    // ------------------------------
    // 6️⃣ Reemplazar valores
    // ------------------------------
    if (valores?.length) {
      await supabase.from('libro_valores').delete().eq('id_libro', idLibro);
      const { error: valoresError } = await supabase
        .from('libro_valores')
        .insert(valores.map((id_valor) => ({ id_libro: idLibro, id_valor })));
      if (valoresError) throw valoresError;
    }

    // ------------------------------
    // 7️⃣ Reemplazar páginas
    // ------------------------------
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const numero_pagina = i + 1;

      const { error } = await supabase
        .from('paginas_libro')
        .upsert(
          {
            id_libro: idLibro,
            numero_pagina,
            layout: page.layout,
            animation: page.animation ?? null,
            title: page.title ?? null,
            text: page.text ?? null,
            image: page.image ?? null,
            audio: page.audio ?? null,
            interactive_game: page.interactiveGame ?? null,
            items: page.items ?? [],
            background: page.background ?? null,
            border: page.border ?? null,
          },
          { onConflict: 'id_libro,numero_pagina' }
        );

      if (error) throw error;
    }

    return { success: true, message: 'Libro actualizado correctamente' };
  } catch (error) {
    console.error('❌ Error actualizando libro:', error);
    throw new Error('No se pudo actualizar el libro');
  }
};