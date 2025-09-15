import { NextResponse } from "next/server";
import { getPagesByBookId } from "@/src/DAL/Libros/conversorbook"; // ajusta tu import real

interface Params {
  idLibro: string;
}

export async function GET(request: Request, { params }: { params: Params }) {
  console.log("🔹 GET /api/libros/pages/[idLibro] llamado");
  console.log("Params recibidos:", params);

  const { idLibro } = params;

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
    console.error("❌ Error en API GET /libros/[idLibro]/pages:", error);
    return NextResponse.json({ error: "Error al obtener páginas" }, { status: 500 });
  }
}
