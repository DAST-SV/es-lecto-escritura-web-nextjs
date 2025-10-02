// app/user-types/[id]/edit/page.tsx
import { createClient } from '@/src/utils/supabase/client';
import EditForm from '@/src/components/user-types/EditForm';
import { UserType } from '@/src/components/user-types/types';

interface EditPageProps {
  params: { id: string };
}

export default async function EditPage({ params }: EditPageProps) {
  const supabase = createClient();
  const tipoId = Number(params.id);

  const { data, error } = await supabase
    .schema('app')
    .from('tipos_usuarios')
    .select('*')
    .eq('id_tipo_usuario', tipoId)
    .single<UserType>();

  if (error) {
    return <p className="text-red-600">Error: {error.message}</p>;
  }
  if (!data) {
    return <p className="text-gray-700">Tipo de usuario no encontrado</p>;
  }

  return <EditForm tipo={data} />;
}
