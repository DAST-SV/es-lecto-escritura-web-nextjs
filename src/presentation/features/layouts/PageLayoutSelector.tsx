import React, { useState } from 'react';
import { Check, Grid3x3, Image, Type, Sparkles } from 'lucide-react';
import { LAYOUT_DEFINITIONS, LayoutDefinition } from '@/src/presentation/features/layouts/layoutDefinitions';

interface PageLayoutSelectorProps {
  currentLayout: string;
  pageNumber: number;
  onLayoutChange: (layout: string) => void;
  isFirstPage?: boolean; // Para mostrar/ocultar portada
}

export function PageLayoutSelector({
  currentLayout,
  pageNumber,
  onLayoutChange,
  isFirstPage = false
}: PageLayoutSelectorProps) {
  const [filter, setFilter] = useState<'all' | 'text' | 'image' | 'mixed' | 'special'>('all');

  // Filtrar layouts
  const filteredLayouts = LAYOUT_DEFINITIONS.filter(layout => {
    // Si NO es primera página, ocultar portada
    if (!isFirstPage && layout.id === 'CoverLayout') return false;
    
    // Filtro por categoría
    if (filter === 'all') return true;
    return layout.category === filter;
  });

  const categoryIcons = {
    all: Grid3x3,
    text: Type,
    image: Image,
    mixed: Grid3x3,
    special: Sparkles
  };

  return (
    <div className="mb-6 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 shadow-sm">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
          🎨 Diseño de la página {pageNumber}
        </h3>
        <p className="text-xs text-gray-600 mt-1">
          Elige cómo quieres organizar el contenido
        </p>
      </div>

      {/* Filtros por categoría */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {(['all', 'text', 'image', 'mixed'] as const).map((cat) => {
          const Icon = categoryIcons[cat];
          const isActive = filter === cat;
          
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                transition-all whitespace-nowrap
                ${isActive 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-white text-gray-700 hover:bg-indigo-50'
                }
              `}
            >
              <Icon size={14} />
              <span>
                {cat === 'all' && 'Todos'}
                {cat === 'text' && 'Solo texto'}
                {cat === 'image' && 'Solo imagen'}
                {cat === 'mixed' && 'Combinados'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid de layouts */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2">
        {filteredLayouts.map((layout) => {
          const isSelected = currentLayout === layout.id;
          
          return (
            <button
              key={layout.id}
              onClick={() => onLayoutChange(layout.id)}
              className={`
                relative group p-3 rounded-lg border-2 transition-all
                ${isSelected 
                  ? 'border-indigo-600 bg-indigo-50 shadow-lg ring-2 ring-indigo-200' 
                  : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md'
                }
              `}
            >
              {/* Preview visual */}
              <div className="aspect-square mb-2 relative overflow-hidden rounded-md bg-gradient-to-br from-gray-50 to-gray-100">
                <div 
                  dangerouslySetInnerHTML={{ __html: layout.preview }}
                  className="w-full h-full p-2"
                />
                
                {/* Check mark */}
                {isSelected && (
                  <div className="absolute top-1 right-1 bg-indigo-600 text-white rounded-full p-1 shadow-lg">
                    <Check size={12} strokeWidth={3} />
                  </div>
                )}

                {/* Special badge */}
                {layout.isSpecial && (
                  <div className="absolute top-1 left-1 bg-amber-500 text-white rounded-full px-2 py-0.5 text-[10px] font-bold">
                    ⭐
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="text-left">
                <p className={`text-xs font-semibold flex items-center gap-1 ${isSelected ? 'text-indigo-900' : 'text-gray-800'}`}>
                  <span>{layout.emoji}</span>
                  <span className="truncate">{layout.name}</span>
                </p>
                <p className="text-[10px] text-gray-600 mt-0.5 line-clamp-2 leading-tight">
                  {layout.description}
                </p>
              </div>

              {/* Hover glow */}
              <div className={`
                absolute inset-0 rounded-lg transition-opacity pointer-events-none
                ${isSelected ? 'opacity-0' : 'opacity-0 group-hover:opacity-5 bg-indigo-500'}
              `} />
            </button>
          );
        })}
      </div>

      {/* No results */}
      {filteredLayouts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No hay layouts en esta categoría</p>
        </div>
      )}

      {/* Ayuda contextual */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          💡 <strong>Tip:</strong> Puedes cambiar el diseño en cualquier momento. 
          {isFirstPage && ' La portada solo está disponible en la primera página.'}
        </p>
      </div>
    </div>
  );
}