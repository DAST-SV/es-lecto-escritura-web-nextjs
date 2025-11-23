import React, { useState } from 'react';
import { Upload, Image, X, AlertCircle } from 'lucide-react';
import { ColorPicker } from './ColorPicker';

interface BackgroundControlsProps {
  currentBackground: string | null | undefined;
  hasBackground: boolean;
  pageNumber: number;
  onBackgroundChange: (value: string) => void;
  onBackgroundFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveBackground: () => void;
  isFirstPage?: boolean;
}

export function BackgroundControls({
  currentBackground,
  hasBackground,
  pageNumber,
  onBackgroundChange,
  onBackgroundFileChange,
  onRemoveBackground,
  isFirstPage = false
}: BackgroundControlsProps) {
  const [showImageUpload, setShowImageUpload] = useState(false);

  // Detectar si tiene imagen de fondo (blob o URL)
  const hasBackgroundImage = 
    currentBackground && 
    typeof currentBackground === 'string' && 
    (currentBackground.startsWith('blob:') || 
     currentBackground.startsWith('http://') || 
     currentBackground.startsWith('https://'));

  // Detectar si tiene color de fondo (hex)
  const hasBackgroundColor = 
    currentBackground && 
    typeof currentBackground === 'string' && 
    currentBackground.startsWith('#');

  // Handler para cambio de color
  const handleColorChange = (color: string) => {
    // Si tiene imagen, mostrar alerta
    if (hasBackgroundImage) {
      if (confirm('⚠️ Ya tienes una imagen de fondo. ¿Deseas eliminarla y usar un color en su lugar?')) {
        onRemoveBackground();
        setTimeout(() => onBackgroundChange(color), 100);
      }
      return;
    }

    onBackgroundChange(color);
  };

  // Handler para subir imagen
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Si tiene color, limpiarlo automáticamente
    if (hasBackgroundColor) {
      onBackgroundChange('blanco');
    }
    
    onBackgroundFileChange(e);
    setShowImageUpload(false);
  };

  return (
    <div className="space-y-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-gray-800">
          {isFirstPage ? '🎨 Fondo de Portada' : `🎨 Fondo de página ${pageNumber}`}
        </h4>
        
        {hasBackground && (
          <button
            onClick={onRemoveBackground}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            <X size={14} />
            Quitar fondo
          </button>
        )}
      </div>

      {/* Selector de tipo de fondo */}
      <div className="space-y-3">
        {/* Opción: Color */}
        <div className={`p-3 rounded-lg border-2 transition-all ${
          !showImageUpload 
            ? 'border-purple-300 bg-white' 
            : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-gray-700">
              🎨 Usar Color
            </label>
            {!showImageUpload && (
              <span className="text-xs text-green-600 font-medium">✓ Activo</span>
            )}
          </div>

          {!showImageUpload ? (
            <ColorPicker
              currentColor={hasBackgroundColor ? currentBackground : '#ffffff'}
              onColorChange={handleColorChange}
            />
          ) : (
            <button
              onClick={() => setShowImageUpload(false)}
              className="w-full px-3 py-2 text-sm text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors font-medium"
            >
              Cambiar a color
            </button>
          )}
        </div>

        {/* Opción: Imagen */}
        <div className={`p-3 rounded-lg border-2 transition-all ${
          showImageUpload 
            ? 'border-purple-300 bg-white' 
            : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-gray-700">
              🖼️ Usar Imagen
            </label>
            {showImageUpload && (
              <span className="text-xs text-green-600 font-medium">✓ Activo</span>
            )}
          </div>

          {showImageUpload ? (
            <div className="space-y-2">
              {hasBackgroundImage ? (
                <div className="space-y-2">
                  {/* Preview de imagen */}
                  <div className="aspect-video rounded-lg overflow-hidden border-2 border-gray-200">
                    <img
                      src={currentBackground}
                      alt="Fondo actual"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Botón cambiar imagen */}
                  <label className="block cursor-pointer">
                    <div className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                      <Upload size={16} />
                      Cambiar imagen
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <label className="block cursor-pointer">
                  <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 hover:border-purple-500 hover:bg-purple-50/50 transition-all">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                        <Image size={24} className="text-purple-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Subir imagen de fondo
                      </p>
                      <p className="text-xs text-gray-500">
                        JPG, PNG o WebP • Máx 5MB
                      </p>
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowImageUpload(true)}
              className="w-full px-3 py-2 text-sm text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors font-medium"
            >
              Cambiar a imagen
            </button>
          )}
        </div>
      </div>

      {/* Ayuda contextual */}
      <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          💡 <strong>Tip:</strong> Puedes usar un color o una imagen, pero no ambos al mismo tiempo
        </p>
      </div>
    </div>
  );
}