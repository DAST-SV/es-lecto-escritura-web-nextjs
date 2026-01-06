/**
 * UBICACIÓN: src/presentation/features/books/components/BookCard/BookCard.tsx
 * 📖 Componente de Ficha Literaria Profesional
 * Uso: Carousels, listas, vistas previas
 */

import React from 'react';

interface BookCardProps {
  portada: string;
  titulo: string;
  autores: string[];
  descripcion?: string;
  personajes?: string[];
  categorias?: string[];
  generos?: string[];
  valores?: string[];
  nivel?: string;
  onClick?: () => void;
  className?: string;
}

export function BookCard({
  portada,
  titulo,
  autores,
  descripcion,
  personajes = [],
  categorias = [],
  generos = [],
  valores = [],
  nivel,
  onClick,
  className = ''
}: BookCardProps) {
  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer group ${className}`}
    >
      <div className="grid grid-cols-3 gap-4 p-4">
        
        {/* PORTADA */}
        <div className="col-span-1">
          <div className="aspect-[3/4] rounded-lg overflow-hidden shadow-md group-hover:scale-105 transition-transform duration-300">
            <img 
              src={portada} 
              alt={titulo} 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* INFO */}
        <div className="col-span-2 flex flex-col justify-between">
          
          {/* Header */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-2">
              {titulo}
            </h3>
            {autores.length > 0 && (
              <p className="text-sm text-gray-600 mb-3">
                por {autores.join(', ')}
              </p>
            )}
          </div>

          {/* Descripción */}
          {descripcion && (
            <p className="text-xs text-gray-700 line-clamp-3 mb-3">
              {descripcion}
            </p>
          )}

          {/* Metadata */}
          <div className="space-y-2">
            
            {/* Personajes */}
            {personajes.length > 0 && (
              <div>
                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wide">Personajes:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {personajes.slice(0, 3).map((p, i) => (
                    <span key={i} className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded-full text-[10px] font-medium">
                      {p}
                    </span>
                  ))}
                  {personajes.length > 3 && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[10px]">
                      +{personajes.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Categorías */}
            {categorias.length > 0 && (
              <div>
                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wide">Categorías:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {categorias.map((c, i) => (
                    <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-[10px] font-medium">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Géneros */}
            {generos.length > 0 && (
              <div>
                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wide">Géneros:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {generos.map((g, i) => (
                    <span key={i} className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full text-[10px] font-medium">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Valores */}
            {valores.length > 0 && (
              <div>
                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wide">Valores:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {valores.slice(0, 3).map((v, i) => (
                    <span key={i} className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-[10px] font-medium">
                      {v}
                    </span>
                  ))}
                  {valores.length > 3 && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[10px]">
                      +{valores.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Nivel */}
            {nivel && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wide">Nivel:</span>
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full text-[10px] font-medium">
                  {nivel}
                </span>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// VERSIÓN COMPACTA (para carousels)
// ============================================
export function BookCardCompact({
  portada,
  titulo,
  autores,
  onClick,
  className = ''
}: Pick<BookCardProps, 'portada' | 'titulo' | 'autores' | 'onClick' | 'className'>) {
  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-lg shadow hover:shadow-lg transition-all cursor-pointer group ${className}`}
    >
      <div className="aspect-[3/4] rounded-t-lg overflow-hidden">
        <img 
          src={portada} 
          alt={titulo} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-3">
        <h4 className="font-bold text-sm text-gray-900 line-clamp-2 mb-1">
          {titulo}
        </h4>
        <p className="text-xs text-gray-600 line-clamp-1">
          {autores.join(', ')}
        </p>
      </div>
    </div>
  );
}