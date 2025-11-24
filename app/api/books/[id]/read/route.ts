/**
 * UBICACIÓN: src/app/api/books/[id]/read/route.ts
 * (o donde hayas creado el archivo)
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/src/utils/supabase/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      { error: "ID de libro es requerido" },
      { status: 400 }
    );
  }

  try {
    const supabase = await createClient();

    // 1. Obtener datos básicos del libro
    const { data: libro, error: libroError } = await supabase
      .from("libros")
      .select("*")
      .eq("id_libro", id)
      .single();

    if (libroError || !libro) {
      return NextResponse.json(
        { error: "Libro no encontrado" },
        { status: 404 }
      );
    }

    // 2. Obtener páginas
    const { data: paginas, error: paginasError } = await supabase
      .from("paginas_libro")
      .select("*")
      .eq("id_libro", id)
      .order("numero_pagina", { ascending: true });

    if (paginasError) {
      console.error("Error obteniendo páginas:", paginasError);
    }

    // 3. Obtener autores ✅ CORREGIDO
    const { data: autoresData } = await supabase
      .from("libros_autores")
      .select("autores(nombre)")
      .eq("id_libro", id);

    const autores = autoresData?.map((item: any) => item.autores.nombre).filter(Boolean) || [];

    // 4. Obtener personajes ✅ CORREGIDO
    const { data: personajesData } = await supabase
      .from("libros_personajes")
      .select("personajes(nombre)")
      .eq("id_libro", id);

    const personajes = personajesData?.map((item: any) => item.personajes.nombre).filter(Boolean) || [];

    // 5. Obtener categorías ✅ CORREGIDO
    const { data: categoriasData } = await supabase
      .from("libro_categorias")
      .select("categorias(nombre)")
      .eq("id_libro", id);

    const categorias = categoriasData?.map((item: any) => item.categorias.nombre).filter(Boolean) || [];

    // 6. Obtener géneros ✅ CORREGIDO
    const { data: generosData } = await supabase
      .from("libro_generos")
      .select("generos(nombre)")
      .eq("id_libro", id);

    const generos = generosData?.map((item: any) => item.generos.nombre).filter(Boolean) || [];

    // 7. Obtener valores ✅ CORREGIDO
    const { data: valoresData } = await supabase
      .from("libro_valores")
      .select("valores(nombre)")
      .eq("id_libro", id);

    const valores = valoresData?.map((item: any) => item.valores.nombre).filter(Boolean) || [];

    // 8. Obtener etiquetas ✅ CORREGIDO
    const { data: etiquetasData } = await supabase
      .from("libro_etiquetas")
      .select("etiquetas(nombre)")
      .eq("id_libro", id);

    const etiquetas = etiquetasData?.map((item: any) => item.etiquetas.nombre).filter(Boolean) || [];

    // 9. Obtener nivel
    let nivelNombre = null;
    if (libro.id_nivel) {
      const { data: nivelData } = await supabase
        .from("niveles")
        .select("nombre")
        .eq("id_nivel", libro.id_nivel)
        .single();
      
      nivelNombre = nivelData?.nombre || null;
    }

    // 10. Construir respuesta completa
    const libroCompleto = {
      id_libro: libro.id_libro,
      titulo: libro.titulo,
      descripcion: libro.descripcion,
      portada: libro.portada,
      fecha_creacion: libro.fecha_creacion,
      
      // Páginas formateadas para el lector
      paginas: paginas?.map(p => ({
        id: p.id_pagina,
        layout: p.layout,
        title: p.title,
        text: p.text,
        image: p.image,
        background: p.background,
        animation: p.animation,
        audio: p.audio,
        interactiveGame: p.interactive_game,
        items: p.items,
        border: p.border
      })) || [],
      
      // Metadata
      autores,
      personajes,
      categorias,
      generos,
      valores,
      etiquetas,
      nivel: nivelNombre
    };

    return NextResponse.json({ libro: libroCompleto });

  } catch (error) {
    console.error("Error al obtener libro completo:", error);
    return NextResponse.json(
      { error: "Error al obtener el libro" },
      { status: 500 }
    );
  }
}