// app/api/quizzes/quizzes
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/utils/supabase/server';
import { CreateQuizData } from '@/src/typings/types-quiz';


export async function POST(request: NextRequest) {
  try {
     let supabase = await createClient();
    const data: CreateQuizData = await request.json();

    // 1. Crear la actividad (quiz)
    const { data: actividad, error: actividadError } = await supabase
      .from('actividades')
      .insert({
        id_libro: data.id_libro,
        id_tipo_actividad: 1, // Asumiendo que 1 es 'quiz'
        titulo: data.titulo,
        descripcion: data.descripcion,
        orden: data.orden,
        puntos_maximos: data.puntos_maximos || 100,
        tiempo_limite: data.tiempo_limite,
        intentos_permitidos: data.intentos_permitidos,
        activo: true,
      })
      .select()
      .single();

    if (actividadError) throw actividadError;

    // 2. Crear las preguntas
    const preguntasConActividad = data.preguntas.map((pregunta, index) => ({
      id_actividad: actividad.id_actividad,
      texto_pregunta: pregunta.texto_pregunta,
      tipo_pregunta: pregunta.tipo_pregunta,
      puntos: pregunta.puntos || 1,
      orden: pregunta.orden || index + 1,
      explicacion: pregunta.explicacion,
    }));

    const { data: preguntasCreadas, error: preguntasError } = await supabase
      .from('preguntas')
      .insert(preguntasConActividad)
      .select();

    if (preguntasError) throw preguntasError;

    // 3. Crear las opciones de respuesta
    const opcionesPromises = preguntasCreadas.map(async (pregunta, index) => {
      const opcionesConPregunta = data.preguntas[index].opciones.map(
        (opcion, opcionIndex) => ({
          id_pregunta: pregunta.id_pregunta,
          texto_opcion: opcion.texto_opcion,
          es_correcta: opcion.es_correcta,
          orden: opcion.orden || opcionIndex + 1,
        })
      );

      const { data: opciones, error: opcionesError } = await supabase
        .from('opciones_respuesta')
        .insert(opcionesConPregunta)
        .select();

      if (opcionesError) throw opcionesError;
      return opciones;
    });

    await Promise.all(opcionesPromises);

    return NextResponse.json(
      {
        success: true,
        data: actividad,
        message: 'Quiz creado exitosamente',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating quiz:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al crear el quiz',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    let supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const id_libro = searchParams.get('id_libro');

    let query = supabase
      .from('actividades')
      .select(
        `
        *,
        preguntas (
          *,
          opciones_respuesta (*)
        )
      `
      )
      .eq('id_tipo_actividad', 1);

    if (id_libro) {
      query = query.eq('id_libro', id_libro);
    }

    const { data, error } = await query.order('orden', { ascending: true });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener los quizzes',
      },
      { status: 500 }
    );
  }
}