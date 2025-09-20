import { createClient } from "@/src/utils/supabase/client"; // Ajusta tu import

export interface LibroUsuario {
  idlibro: string;
  idusuario: string;
  titulo: string;
  fechacreacion: string;
}

export async function getBooksByUserId(idUsuario: string): Promise<LibroUsuario[]> {
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
