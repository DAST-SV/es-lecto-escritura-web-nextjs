import { createClient } from "@/src/utils/supabase/client"; // ajusta tu import real
import { Page } from "@/src/typings/types-page-book"

// 🔹 Función para convertir un registro de la BD a un objeto Page
function mapDbRecordToPage(record: any): Page {
  console.log("📄 mapeando registro:", record); // log cada registro

  const page: Page = {
    layout: record.layout,
    animation: record.animation ?? undefined,
    title: record.title ?? undefined,
    text: record.text ?? undefined,
    image: record.image ?? undefined,
    audio: record.audio ?? undefined,
    interactiveGame: record.interactive_game ?? undefined,
    items: [],
    background: record.background ?? undefined,
    border: record.border ?? undefined,
  };

  console.log("✅ Page mapeada:", page); // log objeto final
  return page;
}

// 🔹 Función que obtiene registros por idlibro y devuelve Page[]
export async function getPagesByBookId(idLibro: string): Promise<Page[]> {
  console.log("📚 Obteniendo páginas para libro:", idLibro);

  const supabase = createClient();

  const { data, error } = await supabase
    .from("paginas_libro")
    .select("*")
    .eq("id_libro", idLibro)
    .order("numero_pagina", { ascending: true });

  if (error) {
    console.error("❌ Error obteniendo páginas:", error);
    throw error;
  }

  console.log("📊 Datos recibidos:", data);

  if (!data || data.length === 0) {
    console.warn("⚠ No se encontraron páginas para este libro.");
    return [];
  }

  // Mapear cada registro a Page
  const pages = data.map(mapDbRecordToPage);
  console.log("🗂 Total de páginas mapeadas:", pages.length);
  return pages;
}
