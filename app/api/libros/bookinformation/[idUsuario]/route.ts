import { NextResponse } from "next/server";
import { getBooksByUserId } from "@/src/DAL/Libros/bookinformation"; // Ajusta tu import

interface Params {
  idUsuario: string;
}

export async function GET(request: Request, { params }: { params: Params }) {
  console.log("🔹 GET /api/libros/usuario/[idUsuario] llamado");  
  console.log("Params recibidos:", params);

  const { idUsuario } = params;

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
