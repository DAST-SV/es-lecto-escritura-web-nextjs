// src/app/api/libros/[idLibro]/route.ts
import { NextResponse } from 'next/server';
import { deleteBook } from '@/src/DAL/Libros/deletebook';
import { createClient } from "@/src/utils/supabase/server" // tu wrapper con cookies


interface Params {
  idLibro: string;
}

export async function DELETE(
  request: Request,
  { params }: { params: Params }
) {
  const supabase =  await createClient();
  try {
    const { idLibro } = params;

    if (!idLibro) {
      return NextResponse.json(
        { error: 'idLibro es requerido' },
        { status: 400 }
      );
    }

    // Obtener el usuario autenticado
   
    const { data: { user }, error } = await supabase.auth.getUser()
    if ( !user) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }

    // Llamar a la DAL para eliminar libro
    const result = await deleteBook(user.id, idLibro);

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('❌ Error en API DELETE /libros/:idLibro:', error);
    return NextResponse.json(
      { error: 'No se pudo eliminar el libro' },
      { status: 500 }
    );
  }
}
