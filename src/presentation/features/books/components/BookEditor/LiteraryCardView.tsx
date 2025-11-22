/**
 * UBICACIÓN: src/presentation/features/books/components/BookEditor/LiteraryCardView.tsx
 * 
 * Vista de carta de Ficha Literaria - MÁS PEQUEÑA (400px)
 */

'use client';

import React from 'react';
import { BookOpen, User, Award } from 'lucide-react';

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
    <div className="w-full h-full flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Carta de la ficha - MÁS PEQUEÑA */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
          <div className="flex flex-col md:flex-row h-[400px]">
            
            {/* IZQUIERDA: Imagen (35%) */}
            <div className="w-full md:w-[35%] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
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

            {/* DERECHA: Información (65%) */}
            <div className="w-full md:w-[65%] p-5 flex flex-col justify-center space-y-3">
              
              {/* Título */}
              <h3 className="text-2xl font-bold text-gray-900 leading-tight">
                {titulo || 'Título del libro'}
              </h3>

              {/* Autores */}
              {autores.length > 0 && (
                <div className="flex items-start gap-2">
                  <User size={16} className="text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm font-medium text-gray-700">
                    {autores.join(', ')}
                  </div>
                </div>
              )}

              {/* Nivel */}
              {nivel && (
                <div className="flex items-center gap-2">
                  <Award size={14} className="text-yellow-600" />
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2.5 py-0.5 rounded-full font-medium">
                    {nivel}
                  </span>
                </div>
              )}

              {/* Descripción */}
              {descripcion && (
                <p className="text-xs text-gray-600 leading-relaxed">
                  {truncate(descripcion, 150)}
                </p>
              )}

              {/* Tags compactos */}
              <div className="flex flex-wrap gap-1.5">
                {categorias.map((cat, idx) => (
                  <span
                    key={`cat-${idx}`}
                    className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium"
                  >
                    {cat}
                  </span>
                ))}
                {generos.map((gen, idx) => (
                  <span
                    key={`gen-${idx}`}
                    className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-medium"
                  >
                    {gen}
                  </span>
                ))}
                {valores.slice(0, 2).map((val, idx) => (
                  <span
                    key={`val-${idx}`}
                    className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium"
                  >
                    {val}
                  </span>
                ))}
                {valores.length > 2 && (
                  <span className="text-xs text-gray-600 font-medium">
                    +{valores.length - 2}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}