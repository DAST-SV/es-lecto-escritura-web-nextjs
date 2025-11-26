'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import BookReader from '@/src/presentation/features/books/components/BookReader/BookReader';
import { page } from '@/src/typings/types-page-book';

export default function LeerLibroPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.id as string;

  const [pages, setPages] = useState<page[]>([]);
  const [title, setTitle] = useState<string>('');
  const [metadata, setMetadata] = useState({
    description: '',
    authors: [] as string[],
    characters: [] as string[],
    categories: [] as string[],
    genres: [] as string[],
    values: [] as string[],
    coverImage: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (bookId) {
      loadBook();
    }
  }, [bookId]);

  const loadBook = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/books/${bookId}/read`);
      const data = await response.json();

      console.log('📚 Datos completos del libro:', data);

      if (data.error) {
        setError(data.error);
        return;
      }

      if (data.libro) {
        const libro = data.libro;
        
        console.log('📄 Páginas:', libro.paginas);
        console.log('👥 Autores:', libro.autores);
        console.log('🎭 Personajes:', libro.personajes);
        
        const paginasFormateadas: page[] = (libro.paginas || []).map((p: any) => ({
          id: p.id || p.id_pagina,
          layout: p.layout || 'default',
          title: p.title || '',
          text: p.text || '',
          image: p.image || '',
          background: p.background || '',
          animation: p.animation || '',
          audio: p.audio || '',
          interactiveGame: p.interactiveGame || p.interactive_game || '',
          items: p.items || [],
          border: p.border || ''
        }));
        
        setPages(paginasFormateadas);
        setTitle(libro.titulo || 'Sin título');
        
        setMetadata({
          description: libro.descripcion || '',
          authors: libro.autores || [],
          characters: libro.personajes || [],
          categories: libro.categorias || [],
          genres: libro.generos || [],
          values: libro.valores || [],
          coverImage: libro.portada || ''
        });
      } else {
        setError('Libro no encontrado');
      }
    } catch (err) {
      console.error('❌ Error cargando libro:', err);
      setError('Error al cargar el libro');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-white text-lg">Cargando libro...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-white text-2xl font-bold mb-2">Error</h1>
          <p className="text-slate-300 mb-6">{error}</p>
          <button
            onClick={handleClose}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className="fixed inset-0 bg-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-yellow-500 text-6xl mb-4">📭</div>
          <h1 className="text-white text-2xl font-bold mb-2">Libro vacío</h1>
          <p className="text-slate-300 mb-6">
            Este libro no tiene páginas para mostrar.
          </p>
          <button
            onClick={handleClose}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <BookReader
      pages={pages}
      title={title}
      author={metadata.authors[0]}
      authors={metadata.authors}
      description={metadata.description}
      characters={metadata.characters}
      categories={metadata.categories}
      genres={metadata.genres}
      values={metadata.values}
      coverImage={metadata.coverImage}
      onClose={handleClose}
      showCloseButton={true}
    />
  );
}