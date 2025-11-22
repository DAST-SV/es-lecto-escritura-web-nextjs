import React from 'react';
import { DragDropImageZone } from '../LayoutSelector/DragDropImageZone';
import { ImagePositionSelector, ImagePosition } from './ImagePositionSelector';

interface ImageControlsProps {
  hasImage: boolean;
  pageNumber: number;
  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  currentImage?: string | null;
  imagePosition?: ImagePosition;
  onPositionChange?: (position: ImagePosition) => void;
}

export function ImageControls({
  hasImage,
  pageNumber,
  onImageChange,
  onRemoveImage,
  currentImage,
  imagePosition = 'center',
  onPositionChange
}: ImageControlsProps) {
  
  const handleFileUpload = (file: File) => {
    // Crear un DataTransfer para simular un evento de input file
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    
    const input = document.createElement('input');
    input.type = 'file';
    input.files = dataTransfer.files;
    
    // Crear evento sintético
    const event = new Event('change', { bubbles: true });
    Object.defineProperty(event, 'target', {
      writable: false,
      value: input
    });
    
    onImageChange(event as any);
  };

  return (
    <div className="space-y-4 p-4 bg-green-50 rounded-xl border border-green-200">
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-3">
          🖼 Imagen de página {pageNumber}
        </label>

        <DragDropImageZone
          onImageUpload={handleFileUpload}
          currentImage={currentImage}
          onRemoveImage={hasImage ? onRemoveImage : undefined}
          maxSizeMB={5}
        />
      </div>

      {/* Selector de posición (solo si hay imagen) */}
      {onPositionChange && (
        <div className="pt-4 border-t border-green-200">
          <ImagePositionSelector
            currentPosition={imagePosition}
            onPositionChange={onPositionChange}
            disabled={!hasImage}
          />
        </div>
      )}

      {/* Ayuda */}
      <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          💡 <strong>Tip:</strong> Las imágenes se optimizan automáticamente
        </p>
      </div>
    </div>
  );
}

export type { ImagePosition };