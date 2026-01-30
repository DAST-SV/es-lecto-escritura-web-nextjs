/**
 * ============================================
 * COMPONENTE: ExploreHero
 * Hero section con título y barra de búsqueda
 * Estilo visual consistente con homepage
 * ============================================
 */

'use client';

import React, { memo, useState, useCallback } from 'react';
import { Search, X, BookOpen, Sparkles } from 'lucide-react';

// ============================================
// TIPOS
// ============================================

interface ExploreHeroProps {
  searchTerm: string;
  onSearch: (term: string) => void;
  totalResults: number;
  isLoading: boolean;
}

// ============================================
// SKELETON
// ============================================

export const ExploreHeroSkeleton: React.FC = memo(() => {
  return (
    <section className="relative py-12 md:py-16 lg:py-20 px-4">
      <div className="container mx-auto max-w-4xl text-center">
        {/* Badge skeleton */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/30 rounded-full w-52 h-10 mx-auto mb-6 animate-pulse" />

        {/* Título skeleton */}
        <div className="space-y-3 mb-4">
          <div className="h-12 md:h-14 lg:h-16 bg-white/30 rounded-2xl w-full max-w-2xl mx-auto animate-pulse" />
        </div>

        {/* Decoración */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-1.5 w-16 bg-yellow-300/50 rounded-full animate-pulse" />
          <div className="h-1.5 w-10 bg-green-300/50 rounded-full animate-pulse" />
          <div className="h-1.5 w-6 bg-blue-300/50 rounded-full animate-pulse" />
        </div>

        {/* Subtítulo skeleton */}
        <div className="h-6 bg-white/30 rounded-xl w-full max-w-xl mx-auto mb-8 animate-pulse" />

        {/* Barra búsqueda skeleton */}
        <div className="h-14 md:h-16 bg-white/50 rounded-full w-full max-w-2xl mx-auto animate-pulse" />
      </div>
    </section>
  );
});

ExploreHeroSkeleton.displayName = 'ExploreHeroSkeleton';

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export const ExploreHero: React.FC<ExploreHeroProps> = memo(
  ({ searchTerm, onSearch, totalResults, isLoading }) => {
    const [localValue, setLocalValue] = useState(searchTerm);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setLocalValue(value);
        onSearch(value);
      },
      [onSearch]
    );

    const handleClear = useCallback(() => {
      setLocalValue('');
      onSearch('');
    }, [onSearch]);

    const handleSubmit = useCallback(
      (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(localValue);
      },
      [localValue, onSearch]
    );

    // Sincronizar con prop externa
    React.useEffect(() => {
      setLocalValue(searchTerm);
    }, [searchTerm]);

    return (
      <section className="relative py-12 md:py-16 lg:py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/95 backdrop-blur-md rounded-full shadow-2xl border-2 border-yellow-300 mb-6">
            <BookOpen className="w-5 h-5 text-blue-600 animate-pulse" />
            <span
              className="text-sm font-black text-blue-700 tracking-wide"
              style={{ fontFamily: 'Comic Sans MS, cursive' }}
            >
              BIBLIOTECA DIGITAL
            </span>
            <Sparkles className="w-4 h-4 text-yellow-500" />
          </div>

          {/* Título */}
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-4 drop-shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
            style={{
              fontFamily: 'Comic Sans MS, cursive',
              textShadow:
                '3px 3px 0px rgba(0,0,0,0.3), 6px 6px 0px rgba(0,0,0,0.1)',
            }}
          >
            Explora Nuestros Libros
          </h1>

          {/* Decoración */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-1.5 w-16 bg-yellow-300 rounded-full shadow-lg" />
            <div className="h-1.5 w-10 bg-green-300 rounded-full shadow-lg" />
            <div className="h-1.5 w-6 bg-blue-300 rounded-full shadow-lg" />
          </div>

          {/* Subtítulo */}
          <p
            className="text-lg md:text-xl text-white font-bold mb-8 drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
            style={{ fontFamily: 'Comic Sans MS, cursive' }}
          >
            Descubre historias increíbles para todas las edades
          </p>

          {/* Barra de búsqueda */}
          <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={localValue}
                onChange={handleChange}
                placeholder="Buscar por título, autor o tema..."
                className="w-full h-14 md:h-16 pl-14 pr-14 text-base md:text-lg font-bold text-blue-800 bg-white rounded-full shadow-2xl border-4 border-yellow-300 focus:border-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-200 transition-all placeholder:text-blue-300"
                style={{ fontFamily: 'Comic Sans MS, cursive' }}
              />

              {/* Icono de búsqueda */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <div className="w-8 h-8 bg-yellow-300 rounded-full flex items-center justify-center">
                  <Search className="w-4 h-4 text-blue-700" />
                </div>
              </div>

              {/* Botón limpiar */}
              {localValue && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              )}
            </div>
          </form>

          {/* Contador de resultados */}
          {!isLoading && (
            <p
              className="mt-4 text-white/80 text-sm font-bold"
              style={{ fontFamily: 'Comic Sans MS, cursive' }}
            >
              {totalResults > 0 ? (
                <>
                  <span className="text-yellow-300">{totalResults.toLocaleString()}</span>{' '}
                  {totalResults === 1 ? 'libro encontrado' : 'libros encontrados'}
                </>
              ) : searchTerm ? (
                'No se encontraron libros'
              ) : null}
            </p>
          )}
        </div>
      </section>
    );
  }
);

ExploreHero.displayName = 'ExploreHero';

export default ExploreHero;
