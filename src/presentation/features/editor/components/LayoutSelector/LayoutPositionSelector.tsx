/**
 * UBICACIÓN: src/presentation/features/editor/components/LayoutSelector/LayoutPositionSelector.tsx
 * 
 * Selector visual de layouts/posiciones para páginas
 * Reemplaza el dropdown de layouts por un selector visual de grilla
 */

import React from 'react';
import { Check } from 'lucide-react';
import { LAYOUT_DEFINITIONS, type LayoutDefinition } from '@/src/presentation/features/layouts/layoutDefinitions';

interface LayoutPositionSelectorProps {
  currentLayout: string;
  pageNumber: number;
  onLayoutChange: (layout: string) => void;
  isFirstPage?: boolean;
}

export function LayoutPositionSelector({
  currentLayout,
  pageNumber,
  onLayoutChange,
  isFirstPage = false
}: LayoutPositionSelectorProps) {
  
  // Filtrar layouts (excluir CoverLayout si no es primera página)
  const availableLayouts = LAYOUT_DEFINITIONS.filter(layout => {
    if (!isFirstPage && layout.id === 'CoverLayout') return false;
    return true;
  });

  return (
    <div className="space-y-3 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          📐 Posición de la imagen
        </h4>
        <span className="text-xs text-gray-600">
          Página {pageNumber}
        </span>
      </div>

      <p className="text-xs text-gray-600">
        Elige cómo quieres organizar la imagen y el texto
      </p>

      {/* Grid de layouts */}
      <div className="grid grid-cols-3 gap-2 max-h-[400px] overflow-y-auto pr-1">
        {availableLayouts.map((layout) => {
          const isSelected = currentLayout === layout.id;
          
          return (
            <button
              key={layout.id}
              onClick={() => onLayoutChange(layout.id)}
              className={`
                relative group p-2 rounded-lg border-2 transition-all aspect-square
                ${isSelected 
                  ? 'border-green-600 bg-green-50 shadow-lg ring-2 ring-green-200' 
                  : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-md'
                }
              `}
              title={layout.description}
            >
              {/* Preview visual del layout */}
              <div className="w-full h-full flex items-center justify-center p-1">
                <div 
                  dangerouslySetInnerHTML={{ __html: layout.preview }}
                  className="w-full h-full"
                />
              </div>

              {/* Check mark cuando está seleccionado */}
              {isSelected && (
                <div className="absolute -top-1 -right-1 bg-green-600 text-white rounded-full p-1 shadow-lg">
                  <Check size={12} strokeWidth={3} />
                </div>
              )}

              {/* Badge especial para portada */}
              {layout.id === 'CoverLayout' && (
                <div className="absolute top-1 left-1 bg-amber-500 text-white rounded px-1.5 py-0.5 text-[10px] font-bold">
                  Portada
                </div>
              )}

              {/* Nombre del layout en hover */}
              <div className="absolute inset-x-0 -bottom-8 text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-gray-900 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap">
                  {layout.name}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Layout seleccionado actual */}
      <div className="pt-3 border-t border-green-200">
        <p className="text-xs text-gray-700">
          <span className="font-semibold">Actual:</span>{' '}
          <span className="text-green-700">
            {LAYOUT_DEFINITIONS.find(l => l.id === currentLayout)?.name || 'Solo texto'}
          </span>
        </p>
        <p className="text-[10px] text-gray-500 mt-1">
          {LAYOUT_DEFINITIONS.find(l => l.id === currentLayout)?.description}
        </p>
      </div>

      {/* Ayuda */}
      <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-[10px] text-blue-800">
          💡 <strong>Tip:</strong> Cada posición organiza tu contenido de forma diferente
        </p>
      </div>
    </div>
  );
}