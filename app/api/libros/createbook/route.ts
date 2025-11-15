// src/app/api/libros/route.ts
import { NextResponse } from "next/server";
import { crearLibroCompleto } from "@/src/DAL/Libros/librosDAL"; // tu DAL
import { noSSR } from "next/dynamic";

export async function POST(req: Request) {
  try {
    // 🔹 Parsear JSON del request
    const { userId, title,categoria,genero,descripcion,portada,etiquetas,autor,nivel,valores } = (await req.json()) as {
      userId: string;
      title: string;
      nivel : number;
      categoria? : number[];
      genero? : number[];
      descripcion? : string;
      autor : string;
      etiquetas? : number[];
      valores? : number[];
      portada? : string;
    };

    if (!userId || !title) {
      return NextResponse.json(
        { ok: false, error: "Faltan userId o title" },
        { status: 400 }
      );
    }

    // 🔹 Llamar a la DAL para crear libro (con background)
    const libroId = await crearLibroCompleto(userId, title,nivel,autor,categoria,genero,descripcion,etiquetas,portada,valores);

    return NextResponse.json({ ok: true, libroId });
  } catch (error: any) {
    console.error("❌ Error creando libro:", error.message);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
