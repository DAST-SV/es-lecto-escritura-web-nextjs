import { supabase } from '@/src/utils/supabase/utilsClient';
import { notFound } from 'next/navigation';
import DiarioEditor from '@/src/components/components-for-diary/diary-editor/DiarioEditor';

interface EditorPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditorPage({ params }: EditorPageProps) {
  const { id } = await params;
  const idEntrada = parseInt(id);

  // Validar que el ID sea un número válido
  if (isNaN(idEntrada)) {
    notFound();
  }

  // Obtener la entrada para verificar que existe
  const { data: entrada, error: errorEntrada } = await supabase
    .from('entradas_de_diario')
    .select('*')
    .eq('id_entrada', idEntrada)
    .single();

  if (errorEntrada || !entrada) {
    console.error('Entrada no encontrada:', idEntrada);
    notFound();
  }

  // Obtener la primera página de la entrada
  const { data: pagina, error: errorPagina } = await supabase
    .from('paginas_de_diario')
    .select('*')
    .eq('id_entrada', idEntrada)
    .eq('numero', 1)
    .single();

  if (errorPagina || !pagina) {
    console.error('Página no encontrada para entrada:', idEntrada);
    notFound();
  }

  return <DiarioEditor idEntrada={idEntrada} paginaInicial={pagina} />;
}