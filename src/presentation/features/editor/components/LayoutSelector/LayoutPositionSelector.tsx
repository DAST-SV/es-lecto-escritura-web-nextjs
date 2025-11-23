/**
 * UBICACIÓN: src/presentation/features/editor/components/LayoutSelector/LayoutPositionSelector.tsx
 * ✅ FINAL: Compacto + Validación simple
 */

import React from 'react';
import { Check, Lock } from 'lucide-react';
import { LAYOUT_DEFINITIONS } from '@/src/presentation/features/layouts/layoutDefinitions';

interface LayoutPositionSelectorProps {
  currentLayout: string;
  pageNumber: number;
  onLayoutChange: (layout: string) => void;
  isFirstPage?: boolean;
  currentImage?: string | null;
}

export function LayoutPositionSelector({
  currentLayout,
  pageNumber,
  onLayoutChange,
  isFirstPage = false,
  currentImage
}: LayoutPositionSelectorProps) {
  
  const hasImage = !!currentImage;
  
  const availableLayouts = LAYOUT_DEFINITIONS.filter(layout => {
    if (!isFirstPage && layout.id === 'CoverLayout') return false;
    return true;
  });

  const canSelectLayout = (layoutId: string): boolean => {
    // Layouts que requieren imagen
    const layoutsWithImage = [
      'ImageLeftTextRightLayout',
      'TextLeftImageRightLayout',
      'SplitTopBottomLayout',
      'ImageFullLayout',
      'SplitLayout',
      'CenterImageDownTextLayout',
      'CoverLayout'
    ];
    
    if (layoutsWithImage.includes(layoutId) && !hasImage) {
      return false;
    }
    
    return true;
  };

  return (
    <div className="space-y-3 p-4 bg-green-50 rounded-xl border border-green-200">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-gray-700">
          📐 Posición de imagen
        </h4>
        <span className="text-xs text-gray-500">
          Pág. {pageNumber}
        </span>
      </div>

      {/* Grid compacto */}
      <div className="grid grid-cols-3 gap-2">
        {availableLayouts.map((layout) => {
          const isSelected = currentLayout === layout.id;
          const canSelect = canSelectLayout(layout.id);
          const isBlocked = !canSelect;
          
          return (
            <button
              key={layout.id}
              onClick={() => {
                if (canSelect) {
                  onLayoutChange(layout.id);
                }
              }}
              disabled={isBlocked}
              className={`
                relative group p-2 rounded-lg border-2 transition-all aspect-square
                ${isSelected 
                  ? 'border-green-600 bg-green-50 shadow-md' 
                  : isBlocked
                    ? 'border-gray-300 bg-gray-100 opacity-50 cursor-not-allowed'
                    : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-sm'
                }
              `}
              title={isBlocked ? '🔒 Sube imagen primero' : layout.description}
            >
              <div 
                dangerouslySetInnerHTML={{ __html: layout.preview }}
                className="w-full h-full"
              />

              {isSelected && !isBlocked && (
                <div className="absolute -top-1 -right-1 bg-green-600 text-white rounded-full p-0.5 shadow-lg">
                  <Check size={10} strokeWidth={3} />
                </div>
              )}

              {isBlocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
                  <Lock size={16} className="text-gray-400" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Info actual */}
      <div className="pt-2 border-t border-green-200">
        <p className="text-xs text-gray-600">
          <strong>Actual:</strong>{' '}
          {LAYOUT_DEFINITIONS.find(l => l.id === currentLayout)?.name || 'Solo texto'}
        </p>
      </div>
    </div>
  );
}