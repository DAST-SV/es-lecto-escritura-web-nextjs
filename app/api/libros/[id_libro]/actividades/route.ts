// app/api/libros/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/src/utils/supabase/client";
import {Actividad} from '@/src/typings/Actividades'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id_libro: string }> }
) {
  const { id_libro } = await context.params;

  if (!id_libro) {
    return NextResponse.json<{ error: string }>(
      { error: "ID de libro es requerido" },
      { status: 400 }
    );
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("actividades")
      .select("*")
      .eq("id_libro", id_libro)

    if (error) throw error;

    if (!data) {
      return NextResponse.json<{ error: string }>(
        { error: "Libro no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json<Actividad[]>(data ?? []);
   } catch (error) {
    console.error("Error al obtener libro:", error);
    return NextResponse.json<{ error: string }>(
      { error: "Error al obtener el libro" },
      { status: 500 }
    );
  }
}
