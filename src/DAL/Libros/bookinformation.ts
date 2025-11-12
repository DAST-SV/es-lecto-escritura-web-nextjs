import { createClient } from "@/src/utils/supabase/client"; // Ajusta tu import
import {Libro} from "@/src/typings/Libro"


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
