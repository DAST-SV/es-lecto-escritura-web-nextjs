'use client';

import { UserType } from '@/src/components/user-types/types';
import { createClient } from '@/src/utils/supabase/client';
import { PostgrestError } from '@supabase/supabase-js';

interface PageProps {
  params: { id: string };
}

export default async function VerTipoPage({ params }: PageProps) {
  const tipoId = Number(params.id);
  if (isNaN(tipoId)) {
    return <p className="text-red-600">ID inválido</p>;
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .schema('app')
    .from('tipos_usuarios')
    .select('*')
    .eq('id_tipo_usuario', tipoId)
    .single() as { data: UserType | null, error: PostgrestError };

  if (error) {
    return <p className="text-red-600">Error al obtener datos: {error.message}</p>;
  }
  if (!data) {
    return <p className="text-gray-600">No se encontró el tipo de usuario con ese ID</p>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen flex justify-center items-start">
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          Detalle del Tipo de Usuario #{data.id_tipo_usuario}
        </h2>
        <p className="mb-2"><span className="font-medium text-gray-700">Nombre:</span> {data.nombre}</p>
        <p><span className="font-medium text-gray-700">Descripción:</span> {data.descripcion ?? 'Sin descripción'}</p>
      </div>
    </div>
  );
}