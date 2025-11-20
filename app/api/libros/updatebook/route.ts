// src/app/api/libros/updatebook/route.ts
import { NextResponse } from "next/server";
import { updateBookFromPages } from "@/src/DAL/Libros/updateBookFromPages ";
import type { Page } from "@/src/typings/types-page-book/index";

export async function PATCH(req: Request) {
  try {
    const {
      idLibro,
      pages,
      categoria,
      genero,
      descripcion,
      portada,
      titulo,
      autores, // 🔥 Ahora es array de strings
      etiquetas,
      nivel,
      valores,
      personajes, // 🔥 NUEVO
    } = (await req.json()) as {
      idLibro: string;
      pages: Page[];
      categoria?: number[];
      genero?: number[];
      valores?: number[];
      descripcion?: string;
      titulo?: string;
      portada?: string;
      etiquetas?: number[];
      autores?: string[]; // 🔥 CAMBIO: array en lugar de string
      nivel: number;
      personajes?: string[]; // 🔥 NUEVO
    };

    // 🔹 Validaciones
    if (!idLibro || !pages || pages.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Faltan idLibro o pages" },
        { status: 400 }
      );
    }

    // 🔹 Actualizar libro con múltiples autores
    const result = await updateBookFromPages(
      idLibro,
      pages,
      nivel,
      autores, // 🔥 Pasar array de autores
      personajes,
      etiquetas,
      categoria,
      genero,
      descripcion,
      titulo,
      portada,
      valores
    );

    return NextResponse.json({ ok: true, ...result });
  } catch (error: any) {
    console.error("❌ Error en PATCH /api/libros/updatebook:", error.message);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}