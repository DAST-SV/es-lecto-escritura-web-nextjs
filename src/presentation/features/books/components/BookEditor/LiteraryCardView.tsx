/**
 * UBICACIÓN: src/presentation/features/books/components/BookEditor/LiteraryCardView.tsx
 * 
 * Vista de carta de Ficha Literaria - COMPACTA Y BALANCEADA
 */

'use client';

import React from 'react';
import { BookOpen, User, Award, Tag, Star } from 'lucide-react';

interface LiteraryCardViewProps {
  backgroundUrl: string | null;
  titulo: string;
  autores: string[];
  descripcion: string;
  categorias: string[];
  generos: string[];
  valores: string[];
  nivel: string | null;
}

export function LiteraryCardView({
  backgroundUrl,
  titulo,
  autores,
  descripcion,
  categorias,
  generos,
  valores,
  nivel,
}: LiteraryCardViewProps) {
  
  const truncate = (text: string, max: number) => {
    if (!text || text.length <= max) return text;
    return text.substring(0, max).trim() + '...';
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-6 overflow-auto">
      {/* Contenedor con ancho máximo */}
      <div className="w-full max-w-2xl">
        {/* Carta compacta */}
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden border-2 border-gray-200">
          <div className="grid grid-cols-2 gap-0" style={{ height: '400px' }}>
            
            {/* COLUMNA IZQUIERDA: Imagen (50%) */}
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              {backgroundUrl ? (
                <img
                  src={backgroundUrl}
                  alt="Fondo de ficha"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400 p-6">
                  <BookOpen size={48} className="mb-3 opacity-50" />
                  <p className="text-xs font-medium text-center">
                    Sin imagen de fondo
                  </p>
                </div>
              )}
            </div>

            {/* COLUMNA DERECHA: Información (50%) - CON SCROLL */}
            <div className="p-4 overflow-y-auto">
              <div className="space-y-3">
                
                {/* Título */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 leading-tight line-clamp-2">
                    {titulo || 'Título del libro'}
                  </h3>
                </div>

                {/* Autores */}
                {autores.length > 0 && (
                  <div className="flex items-start gap-2">
                    <User size={14} className="text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs font-medium text-gray-700 line-clamp-2">
                      {autores.join(', ')}
                    </div>
                  </div>
                )}

                {/* Nivel */}
                {nivel && (
                  <div className="flex items-center gap-2">
                    <Award size={12} className="text-yellow-600 flex-shrink-0" />
                    <span className="text-[10px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium">
                      {nivel}
                    </span>
                  </div>
                )}

                {/* Descripción */}
                {descripcion && (
                  <div>
                    <p className="text-[11px] text-gray-600 leading-relaxed line-clamp-3">
                      {truncate(descripcion, 120)}
                    </p>
                  </div>
                )}

                {/* Categorías */}
                {categorias.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Tag size={11} className="text-blue-600" />
                      <span className="text-[10px] font-semibold text-gray-700">Categoría</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {categorias.map((cat, idx) => (
                        <span
                          key={`cat-${idx}`}
                          className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Géneros */}
                {generos.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Star size={11} className="text-purple-600" />
                      <span className="text-[10px] font-semibold text-gray-700">Géneros</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {generos.slice(0, 2).map((gen, idx) => (
                        <span
                          key={`gen-${idx}`}
                          className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-medium"
                        >
                          {gen}
                        </span>
                      ))}
                      {generos.length > 2 && (
                        <span className="text-[10px] text-purple-600 font-medium">
                          +{generos.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Valores */}
                {valores.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Award size={11} className="text-green-600" />
                      <span className="text-[10px] font-semibold text-gray-700">Valores</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {valores.slice(0, 3).map((val, idx) => (
                        <span
                          key={`val-${idx}`}
                          className="text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium"
                        >
                          {val}
                        </span>
                      ))}
                      {valores.length > 3 && (
                        <span className="text-[10px] text-green-600 font-medium">
                          +{valores.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Nota informativa */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            📌 Esta es la tarjeta que se mostrará en catálogos y búsquedas
          </p>
        </div>
      </div>
    </div>
  );
}