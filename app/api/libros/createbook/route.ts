// src/app/api/libros/createbook/route.ts
import { NextResponse } from "next/server";
import { crearLibroCompleto } from "@/src/DAL/Libros/librosDAL";

export async function POST(req: Request) {
  try {
    // 🔹 Parsear JSON del request
    const {
      userId,
      title,
      categoria,
      genero,
      descripcion,
      portada,
      etiquetas,
      autores, // 🔥 Ahora es array de strings
      nivel,
      valores,
      personajes, // 🔥 NUEVO
    } = (await req.json()) as {
      userId: string;
      title: string;
      nivel: number;
      categoria?: number[];
      genero?: number[];
      descripcion?: string;
      autores: string[]; // 🔥 CAMBIO: array en lugar de string
      etiquetas?: number[];
      valores?: number[];
      portada?: string;
      personajes?: string[]; // 🔥 NUEVO
    };

    // 🔹 Validaciones
    if (!userId || !title) {
      return NextResponse.json(
        { ok: false, error: "Faltan userId o title" },
        { status: 400 }
      );
    }

    if (!autores || !Array.isArray(autores) || autores.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Debe proporcionar al menos un autor" },
        { status: 400 }
      );
    }

    // 🔹 Llamar a la DAL para crear libro con múltiples autores
    const libroId = await crearLibroCompleto(
      userId,
      title,
      nivel,
      autores, // 🔥 Pasar array de autores
      personajes,
      categoria,
      genero,
      descripcion,
      etiquetas,
      portada,
      valores
    );

    return NextResponse.json({ ok: true, libroId });
  } catch (error: any) {
    console.error("❌ Error creando libro:", error.message);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}