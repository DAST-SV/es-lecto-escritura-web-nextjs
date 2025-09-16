import { NextRequest, NextResponse } from "next/server";
import { getBooksByUserId } from "@/src/DAL/Libros/bookinformation";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ idUsuario: string }> }
) {
  console.log("🔹 GET /api/libros/usuario/[idUsuario] llamado");

  const { idUsuario } = await context.params; // 👈 importante: await aquí
  console.log("Params recibidos:", { idUsuario });

  if (!idUsuario) {
    console.warn("⚠️ idUsuario no recibido");
    return NextResponse.json({ error: "idUsuario es requerido" }, { status: 400 });
  }

  try {
    console.log("🔹 Obteniendo libros del usuario:", idUsuario);
    const libros = await getBooksByUserId(idUsuario);

    console.log("🔹 Libros obtenidos:", libros);

    return NextResponse.json({ libros });
  } catch (error) {
    console.error("❌ Error en API GET /libros/usuario/[idUsuario]:", error);
    return NextResponse.json({ error: "Error al obtener libros" }, { status: 500 });
  }
}
