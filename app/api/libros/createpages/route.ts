// src/controllers/paginasController.ts
import { Page } from "@/src/typings/types-page-book";
import { insertarPaginas } from "@/src/DAL/Libros/PageDAL";

/**
 * Controller para insertar páginas de un libro
 *
 * @param libroId - Id del libro ya creado
 * @param pages - Arreglo de páginas a insertar
 */
export async function crearPaginas(libroId: string, pages: Page[]) {
  if (!libroId) throw new Error("libroId es obligatorio");
  if (!pages || pages.length === 0) throw new Error("No se proporcionaron páginas");

  // Llamamos a la DAL para insertar las páginas
  const cantidadInsertadas = await insertarPaginas(libroId, pages);

  return {
    ok: true,
    cantidadInsertadas,
  };
}
