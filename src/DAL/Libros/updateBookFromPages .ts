import { supabaseAdmin } from '@/src/utils/supabase/admin';
import type { Page } from '@/src/typings/types-page-book/index';

/**
 * Actualiza un libro y sus páginas.
 * - Modifica libros con título, portada, autor y descripción (solo si tienen valor).
 * - Reemplaza relaciones: categorías, géneros y etiquetas.
 * - Reemplaza páginas según numero_pagina.
 */
export const updateBookFromPages = async (
  idLibro: string,
  pages: Page[],
  id_nivel: number,
  autor?: string,
  etiquetas?: number[],
  categoria?: number[],
  genero?: number[],
  descripcion?: string,
  titulo?: string,
  portada?: string,
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
    if (autor != null) updateData.autor = autor;
    if (id_nivel != null) updateData.id_nivel = id_nivel;

    if (Object.keys(updateData).length > 0) {
      const { error: libroError } = await supabase
        .from('libros')
        .update(updateData)
        .eq('id_libro', idLibro);

      if (libroError) throw libroError;
    }

    // ------------------------------
    // 2️⃣ Reemplazar categorías
    // ------------------------------
    if (categoria?.length) {
      await supabase.from('libro_categorias').delete().eq('id_libro', idLibro);
      const { error: categoriaError } = await supabase
        .from('libro_categorias')
        .insert(categoria.map((id_categoria) => ({ id_libro: idLibro, id_categoria })));
      if (categoriaError) throw categoriaError;
    }

    // ------------------------------
    // 3️⃣ Reemplazar géneros
    // ------------------------------
    if (genero?.length) {
      await supabase.from('libro_generos').delete().eq('id_libro', idLibro);
      const { error: generoError } = await supabase
        .from('libro_generos')
        .insert(genero.map((id_genero) => ({ id_libro: idLibro, id_genero })));
      if (generoError) throw generoError;
    }

    // ------------------------------
    // 4️⃣ Reemplazar etiquetas
    // ------------------------------
    if (etiquetas?.length) {
      await supabase.from('libro_etiquetas').delete().eq('id_libro', idLibro);
      const { error: etiquetasError } = await supabase
        .from('libro_etiquetas')
        .insert(etiquetas.map((id_etiqueta) => ({ id_libro: idLibro, id_etiqueta })));
      if (etiquetasError) throw etiquetasError;
    }

    // ------------------------------
    // 5️⃣ Reemplazar páginas
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
