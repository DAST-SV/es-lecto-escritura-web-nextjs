// src/app/api/libros/updatebook/route.ts
import { NextResponse } from "next/server";
import { updateBookFromPages } from "@/src/DAL/Libros/updateBookFromPages ";
import type { Page } from "@/src/typings/types-page-book/index";

export async function PATCH(req: Request) {
  try {
    const { idLibro, pages,categoria,genero,descripcion,portada} = (await req.json()) as {
      idLibro: string;
      pages: Page[];
      categoria? : number;
      genero? : number;
      descripcion? : string;
      portada? : string;
    };

    if (!idLibro || !pages || pages.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Faltan idLibro o pages" },
        { status: 400 }
      );
    }

    const result = await updateBookFromPages(idLibro, pages,categoria,genero,descripcion,portada);

    return NextResponse.json({ ok: true, ...result });
  } catch (error: any) {
    console.error("❌ Error en PATCH /api/libros/updatebook:", error.message);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
