/**
 * UBICACIÓN: src/presentation/features/editor/components/ImageControls/ImageControls.tsx
 * ✅ FINAL: Auto fondo negro al agregar imagen + blanco al quitar
 */

import React from 'react';
import { DragDropImageZone } from '../LayoutSelector/DragDropImageZone';
import { AlertCircle } from 'lucide-react';

interface ImageControlsProps {
  hasImage: boolean;
  pageNumber: number;
  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  currentImage?: string | null;
  currentLayout?: string;
  onLayoutChange?: (layout: string) => void;
  onBackgroundChange?: (color: string) => void; // ✅ NUEVO: Para auto-fondos
}

export function ImageControls({
  hasImage,
  pageNumber,
  onImageChange,
  onRemoveImage,
  currentImage,
  currentLayout = '',
  onLayoutChange,
  onBackgroundChange // ✅ NUEVO
}: ImageControlsProps) {
  
  const handleFileUpload = (file: File) => {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    
    const input = document.createElement('input');
    input.type = 'file';
    input.files = dataTransfer.files;
    
    const event = new Event('change', { bubbles: true });
    Object.defineProperty(event, 'target', {
      writable: false,
      value: input
    });
    
    onImageChange(event as any);

    // ✅ AUTO-SELECCIONAR layout con imagen
    if (onLayoutChange && currentLayout === 'TextCenterLayout') {
      setTimeout(() => {
        onLayoutChange('ImageLeftTextRightLayout');
      }, 100);
    }

    // ✅ AUTO-FONDO NEGRO al agregar imagen
    if (onBackgroundChange) {
      setTimeout(() => {
        onBackgroundChange('#000000');
      }, 150);
    }
  };

  const handleRemoveImage = () => {
    onRemoveImage();

    // ✅ AUTO-FONDO BLANCO al quitar imagen
    if (onBackgroundChange) {
      setTimeout(() => {
        onBackgroundChange('#ffffff');
      }, 100);
    }
  };

  const isTextOnlyLayout = currentLayout === 'TextCenterLayout';

  return (
    <div className="space-y-3 p-4 bg-green-50 rounded-xl border border-green-200">
      <h4 className="text-sm font-bold text-gray-700">
        🖼 Imagen de página {pageNumber}
      </h4>

      {isTextOnlyLayout && hasImage && (
        <div className="flex items-start gap-2 p-2 bg-red-50 border-l-4 border-red-500 rounded-r">
          <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-800">
            <strong>Oculta.</strong> Cambia posición para verla.
          </p>
        </div>
      )}

      <DragDropImageZone
        onImageUpload={handleFileUpload}
        currentImage={currentImage}
        onRemoveImage={hasImage ? handleRemoveImage : undefined}
        maxSizeMB={5}
      />
    </div>
  );
}