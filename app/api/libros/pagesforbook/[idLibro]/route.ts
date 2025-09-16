// src/app/api/libros/pages/[idLibro]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getPagesByBookId } from "@/src/DAL/Libros/conversorbook"; // ajusta tu import real

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ idLibro: string }> }
) {
  console.log("🔹 GET /api/libros/pages/[idLibro] llamado");

  const { idLibro } = await context.params; // 👈 await porque params es Promise
  console.log("Params recibidos:", { idLibro });

  if (!idLibro) {
    console.warn("⚠️ idLibro no recibido");
    return NextResponse.json({ error: "idLibro es requerido" }, { status: 400 });
  }

  try {
    console.log("🔹 Obteniendo páginas del libro:", idLibro);
    const pages = await getPagesByBookId(idLibro);

    console.log("🔹 Páginas obtenidas:", pages);

    return NextResponse.json({ pages });
  } catch (error) {
    console.error("❌ Error en API GET /libros/pages/[idLibro]:", error);
    return NextResponse.json(
      { error: "Error al obtener páginas" },
      { status: 500 }
    );
  }
}
