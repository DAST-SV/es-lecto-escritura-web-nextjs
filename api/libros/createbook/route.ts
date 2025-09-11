// src/app/api/libros/route.ts
import { NextResponse } from "next/server";
import { crearLibroCompleto } from "@/src/DAL/Libros/librosDAL"; // tu DAL

export async function POST(req: Request) {
  console.log("hola")
  try {
    // 🔹 Parsear JSON del request
    const { userId, title } = (await req.json()) as {
      userId: string;
      title: string;
    };

    if (!userId || !title) {
      return NextResponse.json(
        { ok: false, error: "Faltan userId o title" },
        { status: 400 }
      );
    }

    // 🔹 Llamar a la DAL para crear libro
    const libroId = await crearLibroCompleto(userId, title);
    

    return NextResponse.json({ ok: true, libroId });
  } catch (error: any) {
    console.error("❌ Error creando libro:", error.message);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
