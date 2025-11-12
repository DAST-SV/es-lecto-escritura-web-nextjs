'use client';

import { useLibros } from '@/src/components/components-for-books/book/books/hooks/useLibros';
import LibroCard from '@/src/components/components-for-books/book/books/components/LibroCard';
import { Sparkles, BookOpen } from 'lucide-react'; // 🧸 iconos alegres de Lucide

export default function LibrosPage() {
  const { libros, loading, error, fetchLibros } = useLibros();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-100 to-blue-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-sky-500 mb-6"></div>
        <p className="text-sky-700 font-semibold text-lg">Cargando tus libros mágicos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-rose-50 to-pink-100">
        <div className="text-rose-600 text-2xl mb-4">❌ Oops... {error}</div>
        <button
          onClick={fetchLibros}
          className="px-6 py-2 bg-rose-500 text-white rounded-xl shadow hover:bg-rose-600 transition"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-sky-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-sky-200">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <BookOpen className="text-sky-600 w-8 h-8" />
            <div>
              <h1 className="text-3xl font-bold text-sky-800">Mis Libros</h1>
              <p className="text-sky-600">
                {libros.length} {libros.length === 1 ? 'libro' : 'libros'} disponibles
              </p>
            </div>
          </div>
          <Sparkles className="text-amber-400 w-6 h-6 animate-pulse" />
        </div>
      </header>

      {/* Contenido */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        {libros.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl shadow-md border border-sky-100">
            <svg
              className="w-24 h-24 text-sky-300 mx-auto mb-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <h3 className="text-2xl font-semibold text-sky-800 mb-2">¡Aún no tienes libros!</h3>
            <p className="text-sky-600 mb-6">Crea tu primer libro y empieza la aventura.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {libros.map((libro) => (
              <div
                key={libro.id_libro}
                className="transition-transform hover:scale-105 duration-300"
              >
                <LibroCard libro={libro} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
