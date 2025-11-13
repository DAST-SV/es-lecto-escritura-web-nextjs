import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/utils/supabase/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id_actividad: string }> }
) {
  const { id_actividad } = await context.params;

  try {
    const supabase = await createClient();

    const { data: actividad, error: actividadError } = await supabase
      .from('actividades')
      .select('*')
      .eq('id_actividad', id_actividad)
      .eq('id_tipo_actividad', 1)
      .single();

    if (actividadError || !actividad) {
      return NextResponse.json({ success: false, error: 'Quiz no encontrado' }, { status: 404 });
    }

    const { data: preguntas, error: preguntasError } = await supabase
      .from('preguntas')
      .select('*, opciones_respuesta (*)')
      .eq('id_actividad', id_actividad)
      .order('orden', { ascending: true });

    if (preguntasError) {
      return NextResponse.json({ success: false, error: 'Error al obtener preguntas' }, { status: 500 });
    }

    const preguntasFormateadas = preguntas?.map((pregunta) => ({
      ...pregunta,
      opciones: pregunta.opciones_respuesta
        .sort((a: any, b: any) => a.orden - b.orden)
        .map((opcion: any) => ({
          id_opcion: opcion.id_opcion,
          texto_opcion: opcion.texto_opcion,
          es_correcta: opcion.es_correcta,
          orden: opcion.orden,
        })),
    }));

    const quizCompleto = {
      id_actividad: actividad.id_actividad,
      id_libro: actividad.id_libro,
      titulo: actividad.titulo,
      descripcion: actividad.descripcion,
      puntos_maximos: actividad.puntos_maximos,
      tiempo_limite: actividad.tiempo_limite,
      intentos_permitidos: actividad.intentos_permitidos,
      preguntas: preguntasFormateadas,
    };

    return NextResponse.json({ success: true, data: quizCompleto });
  } catch (error) {
    console.error('Error en GET quiz:', error);
    return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id_actividad: string }> }
) {
  const { id_actividad } = await context.params;

  try {
    const supabase = await createClient();
    const body = await request.json();

    const { data: actividadExistente, error: checkError } = await supabase
      .from('actividades')
      .select('id_actividad')
      .eq('id_actividad', id_actividad)
      .eq('id_tipo_actividad', 1)
      .single();

    if (checkError || !actividadExistente) {
      return NextResponse.json({ success: false, error: 'Quiz no encontrado para editar' }, { status: 404 });
    }

    const { error: actividadError } = await supabase
      .from('actividades')
      .update({
        titulo: body.titulo,
        descripcion: body.descripcion,
        puntos_maximos: body.puntos_maximos,
        tiempo_limite: body.tiempo_limite,
        intentos_permitidos: body.intentos_permitidos,
      })
      .eq('id_actividad', id_actividad);

    if (actividadError) throw actividadError;

    await supabase.from('preguntas').delete().eq('id_actividad', id_actividad);

    for (let i = 0; i < body.preguntas.length; i++) {
      const pregunta = body.preguntas[i];
      const { data: nuevaPregunta, error: preguntaError } = await supabase
        .from('preguntas')
        .insert({
          id_actividad,
          texto_pregunta: pregunta.texto_pregunta,
          tipo_pregunta: pregunta.tipo_pregunta,
          puntos: pregunta.puntos,
          orden: i + 1,
          explicacion: pregunta.explicacion,
        })
        .select()
        .single();

      if (preguntaError) throw preguntaError;

      if (pregunta.opciones?.length > 0) {
        const opciones = pregunta.opciones.map((opcion: any, idx: number) => ({
          id_pregunta: nuevaPregunta.id_pregunta,
          texto_opcion: opcion.texto_opcion,
          es_correcta: opcion.es_correcta,
          orden: opcion.orden || idx + 1,
        }));

        const { error: opcionesError } = await supabase.from('opciones_respuesta').insert(opciones);
        if (opcionesError) throw opcionesError;
      }
    }

    return NextResponse.json({ success: true, message: 'Quiz actualizado exitosamente', id_actividad });
  } catch (error) {
    console.error('Error en PUT quiz:', error);
    return NextResponse.json({ success: false, error: 'Error al actualizar el quiz' }, { status: 500 });
  }
}


export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id_actividad: string }> }
) {
  const { id_actividad } = await context.params;

  try {
    const supabase = await createClient();
    const { error } = await supabase.from('actividades').delete().eq('id_actividad', id_actividad);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Quiz eliminado exitosamente' });
  } catch (error) {
    console.error('Error en DELETE quiz:', error);
    return NextResponse.json({ success: false, error: 'Error al eliminar el quiz' }, { status: 500 });
  }
}
