// src/app/api/books/update/route.ts (o donde lo tengas)
import { NextResponse } from "next/server";
import { createClient } from "@/src/utils/supabase/server";
import type { Page } from "@/src/typings/types-page-book/index";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    
    console.log('📥 API /updatebook recibió:', body);

    const {
      idLibro,
      pages,
      categoria,
      genero,
      descripcion,
      portada,
      titulo,
      autores,
      etiquetas,
      nivel,
      valores,
      personajes,
    } = body;

    // ✅ Validaciones
    if (!idLibro) {
      return NextResponse.json(
        { ok: false, error: "idLibro es obligatorio" },
        { status: 400 }
      );
    }

    if (!pages || pages.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Debe haber al menos una página" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 1. Actualizar datos básicos del libro
    await supabase
      .from("libros")
      .update({
        id_nivel: nivel,
        descripcion: descripcion || null,
        titulo: titulo || null,
        portada: portada || null,
      })
      .eq("id_libro", idLibro);

    // 2. Actualizar autores
    if (autores?.length > 0) {
      await supabase.from("libros_autores").delete().eq("id_libro", idLibro);
      
      for (const nombreAutor of autores) {
        if (!nombreAutor.trim()) continue;

        let { data: autorExistente } = await supabase
          .from("autores")
          .select("id_autor")
          .eq("nombre", nombreAutor.trim())
          .single();

        let idAutor: string;

        if (!autorExistente) {
          const { data: nuevoAutor, error: errorAutor } = await supabase
            .from("autores")
            .insert({ nombre: nombreAutor.trim() })
            .select("id_autor")
            .single();

          // ✅ FIX: Verificar que no sea null
          if (errorAutor || !nuevoAutor) {
            console.error('Error creando autor:', errorAutor);
            continue; // Saltar este autor si falla
          }
          
          idAutor = nuevoAutor.id_autor;
        } else {
          idAutor = autorExistente.id_autor;
        }

        await supabase
          .from("libros_autores")
          .insert({ id_libro: idLibro, id_autor: idAutor });
      }
    }

    // 3. Actualizar personajes
    if (personajes?.length > 0) {
      await supabase.from("libros_personajes").delete().eq("id_libro", idLibro);
      
      for (const nombrePersonaje of personajes) {
        if (!nombrePersonaje.trim()) continue;

        let { data: personajeExistente } = await supabase
          .from("personajes")
          .select("id_personaje")
          .eq("nombre", nombrePersonaje.trim())
          .single();

        let idPersonaje: string;

        if (!personajeExistente) {
          const { data: nuevoPersonaje, error: errorPersonaje } = await supabase
            .from("personajes")
            .insert({ nombre: nombrePersonaje.trim() })
            .select("id_personaje")
            .single();

          // ✅ FIX: Verificar que no sea null
          if (errorPersonaje || !nuevoPersonaje) {
            console.error('Error creando personaje:', errorPersonaje);
            continue; // Saltar este personaje si falla
          }
          
          idPersonaje = nuevoPersonaje.id_personaje;
        } else {
          idPersonaje = personajeExistente.id_personaje;
        }

        await supabase
          .from("libros_personajes")
          .insert({ id_libro: idLibro, id_personaje: idPersonaje });
      }
    }

    // 4. Actualizar categorías
    if (categoria?.length > 0) {
      await supabase.from("libro_categorias").delete().eq("id_libro", idLibro);
      for (const idCategoria of categoria) {
        await supabase.from("libro_categorias").insert({ id_libro: idLibro, id_categoria: idCategoria });
      }
    }

    // 5. Actualizar géneros
    if (genero?.length > 0) {
      await supabase.from("libro_generos").delete().eq("id_libro", idLibro);
      for (const idGenero of genero) {
        await supabase.from("libro_generos").insert({ id_libro: idLibro, id_genero: idGenero });
      }
    }

    // 6. Actualizar etiquetas
    if (etiquetas?.length > 0) {
      await supabase.from("libro_etiquetas").delete().eq("id_libro", idLibro);
      for (const idEtiqueta of etiquetas) {
        await supabase.from("libro_etiquetas").insert({ id_libro: idLibro, id_etiqueta: idEtiqueta });
      }
    }

    // 7. Actualizar valores
    if (valores?.length > 0) {
      await supabase.from("libro_valores").delete().eq("id_libro", idLibro);
      for (const idValor of valores) {
        await supabase.from("libro_valores").insert({ id_libro: idLibro, id_valor: idValor });
      }
    }

    // 8. ⭐ ACTUALIZAR PÁGINAS (LO MÁS IMPORTANTE)
    console.log('📄 Eliminando páginas antiguas...');
    await supabase.from("paginas_libro").delete().eq("id_libro", idLibro);

    console.log('📤 Insertando', pages.length, 'páginas nuevas...');
    const paginasParaInsertar = pages.map((page: any, index: number) => ({
      id_libro: idLibro,
      numero_pagina: index + 1,
      layout: page.layout,
      title: page.title || null,
      text: page.text || null,
      image: page.image || null,
      background: page.background || null,
      animation: page.animation || null,
      audio: page.audio || null,
      interactive_game: page.interactiveGame || null,
      items: page.items || null,
      border: page.border || null,
    }));

    const { data: insertedPages, error: insertError } = await supabase
      .from("paginas_libro")
      .insert(paginasParaInsertar)
      .select();

    if (insertError) {
      console.error('❌ Error insertando páginas:', insertError);
      throw insertError;
    }

    console.log('✅ Páginas insertadas:', insertedPages?.length);

    return NextResponse.json({ 
      ok: true, 
      message: "Libro actualizado correctamente",
      paginasActualizadas: insertedPages?.length || 0
    });

  } catch (error: any) {
    console.error("❌ Error en PATCH /updatebook:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Error al actualizar" },
      { status: 500 }
    );
  }
}