// app/user-types/route.ts
import { supabaseAdmin } from '@/src/utils/supabase/admin';

export async function GET() {
  const { data, error } = await supabaseAdmin
    .schema('app')
    .from('tipos_usuarios')
    .select('*')
    .order('id_tipo_usuario', { ascending: false });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }
  return new Response(JSON.stringify(data), { status: 200 });
}

export async function POST(req: Request) {
  try {
    const { nombre, descripcion } = await req.json();

    const { data, error } = await supabaseAdmin
      .schema('app')
      .from('tipos_usuarios')
      .insert([{ nombre, descripcion }])
      .select()
      .single(); // devuelve el objeto creado

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }

    return new Response(JSON.stringify(data), { status: 201 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
