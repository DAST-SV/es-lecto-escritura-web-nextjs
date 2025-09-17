import { supabaseAdmin } from '@/src/utils/supabase/admin';
import type { Page } from '@/src/typings/types-page-book/index';

/**
 * Actualiza un libro y sus páginas.
 * - Modifica LibrosUsuario con título y portada de la primera página.
 * - Reemplaza páginas en PaginasLibro según numeropagina.
 * @param idLibro ID del libro a actualizar
 * @param pages Array de páginas a guardar (debe contener datos de cada página)
 */
export const updateBookFromPages = async (idLibro: string, pages: Page[]) => {
  if (!idLibro) throw new Error('idLibro es requerido');
  if (!pages || pages.length === 0) throw new Error('pages no puede estar vacío');

  const supabase = supabaseAdmin

  const firstPage = pages[0];
  const portada = firstPage.background ?? firstPage.image ?? null;
  const titulo = firstPage.title ?? 'Sin título';

  try {
    // ------------------------------
    // 1️⃣ Actualizar título y portada del libro
    // ------------------------------
    const { error: libroError } = await supabase
      .from('librosusuario')
      .update({ titulo, portada })
      .eq('idlibro', idLibro);

    if (libroError) throw libroError;

    // ------------------------------
    // 2️⃣ Reemplazar páginas según numeropagina
    // ------------------------------
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const numeropagina = i + 1; // Índice + 1 para que empiece en 1

      const { data, error } = await supabase
        .from('paginaslibro')
        .upsert({
          idlibro: idLibro,
          numeropagina: numeropagina,
          layout: page.layout,
          animation: page.animation ?? null,
          title: page.title ?? null,
          text: page.text ?? null,
          image: page.image ?? null,
          audio: page.audio ?? null,
          interactivegame: page.interactiveGame ?? null,
          items: page.items ?? [],
          background: page.background ?? null,
          font: page.font ?? null,
          border: page.border ?? null
        }, { onConflict: 'idlibro,numeropagina' }) // 👈 String con comas


    }

    return { success: true, message: 'Libro actualizado correctamente' };
  } catch (error) {
    console.error('❌ Error actualizando libro:', error);
    throw new Error('No se pudo actualizar el libro');
  }
};
