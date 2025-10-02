import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/src/utils/supabase/admin';

// Soportamos tanto objeto plano como promesa
type Params = { id: string } | Promise<{ id: string }>;

async function resolveParams(params: Params): Promise<{ id: string }> {
  return params instanceof Promise ? await params : params;
}

export async function GET(req: NextRequest, context: { params: Params }) {
  const { id } = await resolveParams(context.params);

  const { data, error } = await supabaseAdmin
    .schema('app')
    .from('tipos_usuarios')
    .select('*')
    .eq('id_tipo_usuario', id)
    .single();

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 404 });
  return new Response(JSON.stringify(data), { status: 200 });
}

export async function PUT(req: NextRequest, context: { params: Params }) {
  const { id } = await resolveParams(context.params);

  try {
    const { nombre, descripcion } = await req.json();

    const { data, error } = await supabaseAdmin
      .schema('app')
      .from('tipos_usuarios')
      .update({ nombre, descripcion })
      .eq('id_tipo_usuario', Number(id))
      .select()
      .single();

    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Params }) {
  const { id } = await resolveParams(context.params);

  const { error } = await supabaseAdmin
    .schema('app')
    .from('tipos_usuarios')
    .delete()
    .eq('id_tipo_usuario', id);

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  return new Response(JSON.stringify({ message: 'Eliminado correctamente' }), { status: 200 });
}
