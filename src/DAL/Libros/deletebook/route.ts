// src/app/api/libros/deletebook/route.ts
import { NextResponse } from "next/server";
import { borrarLibroCompleto } from "@/src/DAL/Libros/deletebookDAL";

export async function POST(req: Request) {
  try {
    const { LibroId, imagenes } = (await req.json()) as {
      LibroId: string;
      imagenes?: string[];
    };

    if (!LibroId) {
      return NextResponse.json(
        { ok: false, error: "Falta LibroId" },
        { status: 400 }
      );
    }

    await borrarLibroCompleto(LibroId, imagenes || []);

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("❌ Error borrando libro:", error.message);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
