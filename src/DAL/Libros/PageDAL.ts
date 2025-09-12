// src/DAL/paginasDAL.ts
import { supabaseAdmin } from "@/src/utils/supabase/admin";
import { Page } from "@/src/typings/types-page-book";

/**
 * Inserta páginas de un libro en la tabla PaginasLibro.
 *
 * @param libroId - Id del libro
 * @param pages - Arreglo de páginas
 */
export async function insertarPaginas(libroId: string, pages: Page[]) {
    
  const paginasToInsert = pages.map((p, idx) => ({
    idlibro: libroId,
    layout: p.layout || "default",
    animation: p.animation || null,
    title: p.title || null,
    text: p.text || null,
    image: p.image || null,
    audio: p.audio || null,
    interactivegame: p.interactiveGame || null,
    items: p.items || [],
    background: p.background || null,
    font: p.font || null,
    border: p.border || null,
    numeropagina: idx + 1,
  }));
  
  console.log("Paginas mapeadas",paginasToInsert)
  const { error } = await supabaseAdmin
    .from("paginaslibro")
    .insert(paginasToInsert);

  if (error) throw error;

  return paginasToInsert.length; // retorna cantidad de páginas insertadas
}
