import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/utils/supabase/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id_actividad: string }> }
)  {
  try {
    
    const supabase = await createClient();
    const { id_actividad } = await params;
    const { es_oficial, id_libro } = await request.json();

    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Si vamos a marcar como oficial, primero desmarcamos todas las demás del mismo libro
    if (es_oficial) {
      const { error: resetError } = await supabase
        .from('actividades')
        .update({ es_oficial: false })
        .eq('id_libro', id_libro);

      if (resetError) {
        console.error('Error al resetear actividades oficiales:', resetError);
        return NextResponse.json(
          { error: 'Error al actualizar actividades' },
          { status: 500 }
        );
      }
    }

    // Actualizamos la actividad seleccionada
    const { data, error } = await supabase
      .from('actividades')
      .update({ es_oficial })
      .eq('id_actividad', id_actividad)
      .select()
      .single();

    if (error) {
      console.error('Error al actualizar actividad oficial:', error);
      return NextResponse.json(
        { error: 'Error al actualizar la actividad' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      actividad: data,
      message: es_oficial 
        ? 'Actividad marcada como oficial' 
        : 'Actividad desmarcada como oficial'
    });

  } catch (error) {
    console.error('Error en PATCH /api/actividades/[id_actividad]/oficial:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}