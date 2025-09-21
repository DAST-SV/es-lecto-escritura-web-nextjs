// src/app/api/libros/route.ts
import { NextResponse } from "next/server";
import { crearLibroCompleto } from "@/src/DAL/Libros/librosDAL"; // tu DAL

export async function POST(req: Request) {
  try {
    // 🔹 Parsear JSON del request
    const { userId, title,categoria,genero,descripcion,portada } = (await req.json()) as {
      userId: string;
      title: string;
      categoria? : number;
      genero? : number;
      descripcion? : string;
      portada? : string;
    };

    if (!userId || !title) {
      return NextResponse.json(
        { ok: false, error: "Faltan userId o title" },
        { status: 400 }
      );
    }

    // 🔹 Llamar a la DAL para crear libro (con background)
    const libroId = await crearLibroCompleto(userId, title,categoria,genero,descripcion,portada);

    return NextResponse.json({ ok: true, libroId });
  } catch (error: any) {
    console.error("❌ Error creando libro:", error.message);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
