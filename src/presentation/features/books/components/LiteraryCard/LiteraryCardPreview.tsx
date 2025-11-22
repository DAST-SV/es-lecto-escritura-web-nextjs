/**
 * UBICACIÓN: src/presentation/features/books/components/LiteraryCard/LiteraryCardPreview.tsx
 * 
 * Preview de cómo se verá la Ficha Literaria en carousels y catálogos públicos
 */

'use client';

import React from 'react';
import { BookOpen, User, Tag, Award, Star } from 'lucide-react';

interface LiteraryCardPreviewProps {
  backgroundUrl: string | null;
  titulo: string;
  autores: string[];
  descripcion: string;
  categorias: string[];
  generos: string[];
  valores: string[];
  nivel: string | null;
}

export function LiteraryCardPreview({
  backgroundUrl,
  titulo,
  autores,
  descripcion,
  categorias,
  generos,
  valores,
  nivel,
}: LiteraryCardPreviewProps) {
  
  // Truncar texto
  const truncate = (text: string, max: number) => {
    if (!text || text.length <= max) return text;
    return text.substring(0, max).trim() + '...';
  };

  return (
    <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
      {/* Imagen de fondo */}
      {backgroundUrl ? (
        <img
          src={backgroundUrl}
          alt="Fondo de ficha"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500" />
      )}

      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30" />

      {/* Contenido */}
      <div className="relative h-full flex flex-col justify-end p-6">
        
        {/* Categoría badge (arriba derecha) */}
        {categorias[0] && (
          <div className="absolute top-4 right-4">
            <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/30">
              <span className="text-xs font-bold text-white">
                {categorias[0]}
              </span>
            </div>
          </div>
        )}

        {/* Nivel badge (arriba izquierda) */}
        {nivel && (
          <div className="absolute top-4 left-4">
            <div className="bg-yellow-400/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <span className="text-xs font-bold text-yellow-900">
                🏆 {nivel}
              </span>
            </div>
          </div>
        )}

        {/* Info principal */}
        <div className="space-y-3">
          {/* Título */}
          <h3 className="text-2xl sm:text-3xl font-bold text-white leading-tight drop-shadow-lg">
            {titulo || 'Título del libro'}
          </h3>

          {/* Autores */}
          {autores.length > 0 && (
            <div className="flex items-center gap-2">
              <User size={16} className="text-white/80" />
              <p className="text-sm font-medium text-white/90">
                {autores.join(', ')}
              </p>
            </div>
          )}

          {/* Descripción */}
          {descripcion && (
            <p className="text-sm text-white/80 leading-relaxed max-w-2xl">
              {truncate(descripcion, 150)}
            </p>
          )}

          {/* Tags horizontales */}
          <div className="flex flex-wrap gap-2 pt-2">
            {/* Géneros */}
            {generos.slice(0, 2).map((genero, idx) => (
              <div
                key={`genero-${idx}`}
                className="bg-purple-500/80 backdrop-blur-sm px-3 py-1 rounded-full border border-purple-300/50"
              >
                <span className="text-xs font-medium text-white flex items-center gap-1">
                  <Star size={12} />
                  {genero}
                </span>
              </div>
            ))}

            {/* Valores */}
            {valores.slice(0, 2).map((valor, idx) => (
              <div
                key={`valor-${idx}`}
                className="bg-green-500/80 backdrop-blur-sm px-3 py-1 rounded-full border border-green-300/50"
              >
                <span className="text-xs font-medium text-white flex items-center gap-1">
                  <Award size={12} />
                  {valor}
                </span>
              </div>
            ))}

            {/* Indicador de más tags */}
            {(generos.length + valores.length > 4) && (
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/30">
                <span className="text-xs font-medium text-white">
                  +{generos.length + valores.length - 4} más
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Icono de libro (decorativo) */}
        <div className="absolute bottom-4 right-4 opacity-20">
          <BookOpen size={64} className="text-white" strokeWidth={1} />
        </div>
      </div>
    </div>
  );
}