import { createClient } from "@/src/utils/supabase/client"; // ajusta tu import real
import {Page} from "@/src/typings/types-page-book"

// 🔹 Función para convertir un registro de la BD a un objeto Page
function mapDbRecordToPage(record: any): Page {
  return {
    layout: record.layout,
    animation: record.animation ?? undefined,
    title: record.title ?? undefined,
    text: record.text ?? undefined,
    image: record.image ?? undefined,
    audio: record.audio ?? undefined,
    interactiveGame: record.interactivegame ?? undefined,
    items: [],
    background: record.background ?? undefined,
    font: record.font ?? undefined,
    border: record.border ?? undefined,
  };
}

// 🔹 Función que obtiene registros por idlibro y devuelve Page[]
export async function getPagesByBookId(idLibro: string): Promise<Page[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("paginaslibro")
    .select("*")
    .eq("idlibro", idLibro)
    .order("numeropagina", { ascending: true }); // ordenadas por número de página

  if (error) {
    console.error("❌ Error obteniendo páginas:", error);
    throw error;
  }

  if (!data) return [];

  // Mapear cada registro a Page
  return data.map(mapDbRecordToPage);
}
