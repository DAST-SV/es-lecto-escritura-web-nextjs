// app/api/libros/bookinformation/[idLibro]/route.ts
import { getBookWithMetadataOptimized } from "@/src/DAL/Libros/bookinformation";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, context: { params: Promise<{ idLibro: string }> }) {
  const { idLibro } = await context.params;
  
  const libro = await getBookWithMetadataOptimized(idLibro); // 👈 Usa esta
  
  if (!libro) {
    return NextResponse.json({ error: "Libro no encontrado" }, { status: 404 });
  }
  
  return NextResponse.json({ libro });
}