import React from 'react';
import { DragDropImageZone } from '../LayoutSelector/DragDropImageZone';
import { AlertCircle } from 'lucide-react';

interface ImageControlsProps {
  hasImage: boolean;
  pageNumber: number;
  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  currentImage?: string | null;
  currentLayout?: string; // Para validar si es TextCenterLayout
}

export function ImageControls({
  hasImage,
  pageNumber,
  onImageChange,
  onRemoveImage,
  currentImage,
  currentLayout = ''
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

  // Validar si el layout actual es "Solo texto"
  const isTextOnlyLayout = currentLayout === 'TextCenterLayout';

  return (
    <div className="space-y-4 p-4 bg-green-50 rounded-xl border border-green-200">
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-3">
          🖼 Imagen de página {pageNumber}
        </label>

        {/* Alerta si es layout "Solo texto" */}
        {isTextOnlyLayout && (
          <div className="mb-3 p-3 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg">
            <div className="flex items-start gap-2">
              <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-900 mb-1">
                  ⚠️ Layout actual: "Solo Texto"
                </p>
                <p className="text-xs text-amber-800">
                  Las imágenes no se mostrarán con este layout. 
                  Cambia la <strong>Posición de la imagen</strong> arriba para ver la imagen.
                </p>
              </div>
            </div>
          </div>
        )}

        <DragDropImageZone
          onImageUpload={handleFileUpload}
          currentImage={currentImage}
          onRemoveImage={hasImage ? onRemoveImage : undefined}
          maxSizeMB={5}
        />
      </div>

      {/* Nota sobre posición */}
      <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          💡 <strong>Nota:</strong> La posición de la imagen se controla desde el selector de "Posición de la imagen" arriba
        </p>
      </div>

      {/* Ayuda adicional */}
      {!isTextOnlyLayout && (
        <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-xs text-green-800">
            ✓ Las imágenes se optimizan automáticamente para mejor rendimiento
          </p>
        </div>
      )}
    </div>
  );
}