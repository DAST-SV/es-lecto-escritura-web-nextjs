import { Page } from "@/src/typings/types-page-book";
import { insertarPaginas } from "@/src/DAL/Libros/PageDAL";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 🔹 Parsear JSON del request
    const body = await req.json();
    console.log("Body recibido:", body);

    const { LibroId, pages } = body as {
      LibroId: string;
      pages: Page[];
    };
    console.log(LibroId);
    console.log(pages);

    if (!LibroId) {
      console.error("Error: libroId es obligatorio");
      throw new Error("libroId es obligatorio");
    }

    if (!pages || pages.length === 0) {
      console.error("Error: No se proporcionaron páginas");
      throw new Error("No se proporcionaron páginas");
    }

    // 🔹 Insertar páginas
    const cantidadInsertadas = await insertarPaginas(LibroId, pages);
    console.log("Cantidad de páginas insertadas:", cantidadInsertadas);

    // ✅ Retornar respuesta como JSON
    return NextResponse.json({
      ok: true,
      cantidadInsertadas,
    });
  } catch (error) {
    console.error("Error en POST /paginas:", error);

    return NextResponse.json(
      {
        ok: false,
        error: (error as Error).message,
      },
      { status: 500 } // opcional, puedes poner 400 o 500 según el tipo de error
    );
  }
}
