/**
 * UBICACIÓN: app/[locale]/books/[id]/edit/page.tsx
 * ✅ CORREGIDO: Uso de fullscreen en UnifiedLayout
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { createClient } from '@/src/utils/supabase/client';
import { GetBookUseCase } from '@/src/core/application/use-cases/books/GetBook.usecase';
import UnifiedLayout from '@/src/components/nav/UnifiedLayout';
import { BookEditor } from '@/src/presentation/features/books/components/BookEditor/BookEditor';
import { Page, LayoutType } from '@/src/core/domain/types';

export default function EditBookPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const supabase = createClient();
  const bookId = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookData, setBookData] = useState<{
    pages: Page[];
    titulo: string;
    autores: string[];
    descripcion: string;
    personajes: string[];
    categorias: number[];
    generos: number[];
    etiquetas: number[];
    valores: number[];
    nivel: number | null;
    portadaUrl: string | null;
  } | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    async function loadBook() {
      if (!bookId) {
        setError('ID de libro no válido');
        setIsLoading(false);
        return;
      }

      try {
        // Verificar usuario
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setError('Debes iniciar sesión para editar libros');
          setIsLoading(false);
          return;
        }

        // Cargar libro
        const libro = await GetBookUseCase.execute(bookId);

        if (!libro) {
          setError('Libro no encontrado');
          setIsLoading(false);
          return;
        }

        // Verificar propiedad
        const { data: bookRecord } = await supabase
          .from('books')
          .select('user_id')
          .eq('id', bookId)
          .single();

        if (bookRecord?.user_id !== user.id) {
          setError('No tienes permiso para editar este libro');
          setIsLoading(false);
          return;
        }

        setIsOwner(true);

        // Transformar datos
        const pages: Page[] = (libro.paginas || []).map((p: any, idx: number) => ({
          id: p.id || `page-${idx}`,
          layout: (p.layout || 'TextCenterLayout') as LayoutType,
          title: p.title || '',
          text: p.text || p.content || '',
          image: p.image || p.image_url || null,
          background: p.background || p.background_url || p.background_color || 'blanco',
        }));

        // Obtener IDs de categorías/géneros/etc
        const categoriaIds = await getCategoryIds(libro.categorias || []);
        const generoIds = await getGenreIds(libro.generos || []);
        const etiquetaIds = await getTagIds(libro.etiquetas || []);
        const valorIds = await getValueIds(libro.valores || []);
        const nivelId = libro.nivel?.id || null;

        setBookData({
          pages,
          titulo: libro.titulo || '',
          autores: libro.autores || [],
          descripcion: libro.descripcion || '',
          personajes: libro.personajes || [],
          categorias: categoriaIds,
          generos: generoIds,
          etiquetas: etiquetaIds,
          valores: valorIds,
          nivel: nivelId,
          portadaUrl: libro.portada || null,
        });

        setIsLoading(false);
      } catch (err: any) {
        console.error('Error cargando libro:', err);
        setError(err.message || 'Error al cargar el libro');
        setIsLoading(false);
      }
    }

    // Helpers para obtener IDs
    async function getCategoryIds(names: string[]): Promise<number[]> {
      if (!names.length) return [];
      const { data } = await supabase
        .from('book_categories')
        .select('id, name')
        .in('name', names);
      return (data || []).map(c => c.id);
    }

    async function getGenreIds(names: string[]): Promise<number[]> {
      if (!names.length) return [];
      const { data } = await supabase
        .from('book_genres')
        .select('id, name')
        .in('name', names);
      return (data || []).map(g => g.id);
    }

    async function getTagIds(names: string[]): Promise<number[]> {
      if (!names.length) return [];
      const { data } = await supabase
        .from('book_tags')
        .select('id, name')
        .in('name', names);
      return (data || []).map(t => t.id);
    }

    async function getValueIds(names: string[]): Promise<number[]> {
      if (!names.length) return [];
      const { data } = await supabase
        .from('book_values')
        .select('id, name')
        .in('name', names);
      return (data || []).map(v => v.id);
    }

    loadBook();
  }, [bookId, supabase]);

  // Loading state
  if (isLoading) {
    return (
      <UnifiedLayout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="text-center">
            <Loader2 size={48} className="animate-spin text-indigo-600 mx-auto mb-4" />
            <p className="text-gray-600">Cargando libro para editar...</p>
          </div>
        </div>
      </UnifiedLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <UnifiedLayout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={40} className="text-red-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No se puede editar
            </h2>
            
            <p className="text-gray-600 mb-6">{error}</p>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={() => router.push(`/${locale}/books`)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
              >
                <ArrowLeft size={20} />
                Volver a biblioteca
              </button>
            </div>
          </div>
        </div>
      </UnifiedLayout>
    );
  }

  if (!bookData) {
    return null;
  }

  // ✅ Usar fullscreen para el editor
  return (
    <UnifiedLayout fullscreen={true}>
      <div className="w-full h-screen overflow-hidden" style={{ zIndex: 9999 }}>
        <BookEditor
          IdLibro={bookId}
          initialPages={bookData.pages}
          title={bookData.titulo}
          initialMetadata={{
            titulo: bookData.titulo,
            autores: bookData.autores,
            descripcion: bookData.descripcion,
            personajes: bookData.personajes,
            selectedCategorias: bookData.categorias,
            selectedGeneros: bookData.generos,
            selectedEtiquetas: bookData.etiquetas,
            selectedValores: bookData.valores,
            selectedNivel: bookData.nivel,
            portadaUrl: bookData.portadaUrl,
          }}
        />
      </div>
    </UnifiedLayout>
  );
}