// app/api/libros/[id_libro]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/src/utils/supabase/client";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id_libro: string }> } // ✅ debe coincidir con [id_libro]
) {
  const { id_libro } = await context.params; // ✅ destructurar el nombre correcto

  if (!id_libro) {
    return NextResponse.json(
      { error: "ID de libro es requerido" },
      { status: 400 }
    );
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("libros")
      .select("*")
      .eq("id_libro", id_libro)
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { error: "Libro no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ libro: data });
  } catch (error) {
    console.error("Error al obtener libro:", error);
    return NextResponse.json(
      { error: "Error al obtener el libro" },
      { status: 500 }
    );
  }
}
