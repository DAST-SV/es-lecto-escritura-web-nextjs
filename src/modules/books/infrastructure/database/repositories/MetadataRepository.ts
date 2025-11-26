/**
 * UBICACIÓN: src/modules/books/infrastructure/database/repositories/MetadataRepository.ts
 */

import { supabaseAdmin } from '@/src/utils/supabase/admin';

export class MetadataRepository {
  
  /**
   * Reemplazar autores de un libro
   */
  static async replaceAutores(libroId: string, autores: string[]) {
    // Obtener autores actuales
    const { data: autoresActuales } = await supabaseAdmin
      .from('libros_autores')
      .select('id_autor, autores(nombre)')
      .eq('id_libro', libroId);

    const autoresActualesMap = new Map<string, string>();
    const idsActuales = new Set<string>();

    (autoresActuales || []).forEach((item: any) => {
      const nombreActual = item.autores?.nombre?.toLowerCase().trim();
      if (nombreActual) {
        autoresActualesMap.set(nombreActual, item.id_autor);
        idsActuales.add(item.id_autor);
      }
    });

    const autoresIdsFinales: string[] = [];
    const autoresAMantener = new Set<string>();

    // Procesar nuevos autores
    for (const nombreAutor of autores) {
      const nombreLimpio = nombreAutor.trim();
      if (!nombreLimpio) continue;

      const nombreNormalizado = nombreLimpio.toLowerCase();

      if (autoresActualesMap.has(nombreNormalizado)) {
        const idExistente = autoresActualesMap.get(nombreNormalizado)!;
        autoresIdsFinales.push(idExistente);
        autoresAMantener.add(idExistente);
      } else {
        const { data, error } = await supabaseAdmin
          .from('autores')
          .insert({ nombre: nombreLimpio })
          .select('id_autor')
          .single();

        if (error || !data) continue;
        autoresIdsFinales.push(data.id_autor);
      }
    }

    // Eliminar autores que ya no están
    const autoresAEliminar = Array.from(idsActuales).filter(id => !autoresAMantener.has(id));

    if (autoresAEliminar.length > 0) {
      await supabaseAdmin
        .from('libros_autores')
        .delete()
        .eq('id_libro', libroId)
        .in('id_autor', autoresAEliminar);
    }

    // Insertar nuevos autores
    const autoresNuevos = autoresIdsFinales.filter(id => !idsActuales.has(id));

    if (autoresNuevos.length > 0) {
      await supabaseAdmin
        .from('libros_autores')
        .insert(autoresNuevos.map(id_autor => ({ id_libro: libroId, id_autor })));
    }
  }

  /**
   * Reemplazar personajes de un libro
   */
  static async replacePersonajes(libroId: string, personajes: string[]) {
    const { data: personajesActuales } = await supabaseAdmin
      .from('libros_personajes')
      .select('id_personaje, personajes(nombre)')
      .eq('id_libro', libroId);

    const personajesActualesMap = new Map<string, string>();
    const idsActuales = new Set<string>();

    (personajesActuales || []).forEach((item: any) => {
      const nombreActual = item.personajes?.nombre?.toLowerCase().trim();
      if (nombreActual) {
        personajesActualesMap.set(nombreActual, item.id_personaje);
        idsActuales.add(item.id_personaje);
      }
    });

    const personajesIdsFinales: string[] = [];
    const personajesAMantener = new Set<string>();

    for (const nombrePersonaje of personajes) {
      const nombreLimpio = nombrePersonaje.trim();
      if (!nombreLimpio) continue;

      const nombreNormalizado = nombreLimpio.toLowerCase();

      if (personajesActualesMap.has(nombreNormalizado)) {
        const idExistente = personajesActualesMap.get(nombreNormalizado)!;
        personajesIdsFinales.push(idExistente);
        personajesAMantener.add(idExistente);
      } else {
        const { data, error } = await supabaseAdmin
          .from('personajes')
          .insert({ nombre: nombreLimpio })
          .select('id_personaje')
          .single();

        if (error || !data) continue;
        personajesIdsFinales.push(data.id_personaje);
      }
    }

    const personajesAEliminar = Array.from(idsActuales).filter(id => !personajesAMantener.has(id));

    if (personajesAEliminar.length > 0) {
      await supabaseAdmin
        .from('libros_personajes')
        .delete()
        .eq('id_libro', libroId)
        .in('id_personaje', personajesAEliminar);
    }

    const personajesNuevos = personajesIdsFinales.filter(id => !idsActuales.has(id));

    if (personajesNuevos.length > 0) {
      await supabaseAdmin
        .from('libros_personajes')
        .insert(personajesNuevos.map(id_personaje => ({ id_libro: libroId, id_personaje })));
    }
  }

  /**
   * Reemplazar categorías
   */
  static async replaceCategorias(libroId: string, categorias: number[]) {
    await supabaseAdmin.from('libro_categorias').delete().eq('id_libro', libroId);
    
    if (categorias.length > 0) {
      await supabaseAdmin
        .from('libro_categorias')
        .insert(categorias.map(id_categoria => ({ id_libro: libroId, id_categoria })));
    }
  }

  /**
   * Reemplazar géneros
   */
  static async replaceGeneros(libroId: string, generos: number[]) {
    await supabaseAdmin.from('libro_generos').delete().eq('id_libro', libroId);
    
    if (generos.length > 0) {
      await supabaseAdmin
        .from('libro_generos')
        .insert(generos.map(id_genero => ({ id_libro: libroId, id_genero })));
    }
  }

  /**
   * Reemplazar etiquetas
   */
  static async replaceEtiquetas(libroId: string, etiquetas: number[]) {
    await supabaseAdmin.from('libro_etiquetas').delete().eq('id_libro', libroId);
    
    if (etiquetas.length > 0) {
      await supabaseAdmin
        .from('libro_etiquetas')
        .insert(etiquetas.map(id_etiqueta => ({ id_libro: libroId, id_etiqueta })));
    }
  }

  /**
   * Reemplazar valores
   */
  static async replaceValores(libroId: string, valores: number[]) {
    await supabaseAdmin.from('libro_valores').delete().eq('id_libro', libroId);
    
    if (valores.length > 0) {
      await supabaseAdmin
        .from('libro_valores')
        .insert(valores.map(id_valor => ({ id_libro: libroId, id_valor })));
    }
  }
}