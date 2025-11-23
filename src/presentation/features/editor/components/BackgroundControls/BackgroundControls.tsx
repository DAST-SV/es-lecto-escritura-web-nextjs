import React, { useState } from 'react';
import { Upload, Image, X, Palette, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [colorOpen, setColorOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);

  // Detectar tipo de fondo actual
  const hasBackgroundImage = 
    currentBackground && 
    typeof currentBackground === 'string' && 
    (currentBackground.startsWith('blob:') || 
     currentBackground.startsWith('http://') || 
     currentBackground.startsWith('https://'));

  const hasBackgroundColor = 
    currentBackground && 
    typeof currentBackground === 'string' && 
    currentBackground.startsWith('#');

  // Handler para cambio de color (NO elimina imagen)
  const handleColorChange = (color: string) => {
    onBackgroundChange(color);
  };

  // Handler para subir imagen (NO elimina color)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    onBackgroundFileChange(e);
  };

  return (
    <div className="space-y-3 p-3 bg-purple-50 rounded-xl border border-purple-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-gray-800">
          {isFirstPage ? '🎨 Fondo Portada' : `🎨 Fondo página ${pageNumber}`}
        </h4>
        
        {hasBackground && (
          <button
            onClick={onRemoveBackground}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            <X size={14} />
            Limpiar
          </button>
        )}
      </div>

      {/* Info */}
      <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          💡 Usa color, imagen o ambos juntos
        </p>
      </div>

      {/* SECCIÓN: Color */}
      <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
        <button
          onClick={() => setColorOpen(!colorOpen)}
          className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Palette size={16} className="text-purple-600" />
            <span className="text-sm font-semibold text-gray-700">Color de fondo</span>
          </div>
          <div className="flex items-center gap-2">
            {hasBackgroundColor && (
              <div 
                className="w-5 h-5 rounded border-2 border-gray-300"
                style={{ backgroundColor: currentBackground }}
              />
            )}
            {colorOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </button>

        {colorOpen && (
          <div className="px-3 pb-3 border-t border-gray-200">
            <ColorPicker
              currentColor={hasBackgroundColor ? currentBackground : '#ffffff'}
              onColorChange={handleColorChange}
              label=""
            />
          </div>
        )}
      </div>

      {/* SECCIÓN: Imagen */}
      <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
        <button
          onClick={() => setImageOpen(!imageOpen)}
          className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Image size={16} className="text-purple-600" />
            <span className="text-sm font-semibold text-gray-700">Imagen de fondo</span>
          </div>
          <div className="flex items-center gap-2">
            {hasBackgroundImage && (
              <span className="text-xs text-green-600 font-medium">✓</span>
            )}
            {imageOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </button>

        {imageOpen && (
          <div className="px-3 pb-3 border-t border-gray-200 space-y-2">
            {hasBackgroundImage ? (
              <>
                {/* Preview */}
                <div className="aspect-video rounded-lg overflow-hidden border-2 border-gray-200">
                  <img
                    src={currentBackground}
                    alt="Fondo"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Botón cambiar */}
                <label className="block cursor-pointer">
                  <div className="flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                    <Upload size={14} />
                    Cambiar imagen
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </>
            ) : (
              <label className="block cursor-pointer">
                <div className="border-2 border-dashed border-purple-300 rounded-lg p-4 hover:border-purple-500 hover:bg-purple-50/50 transition-all">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                      <Image size={20} className="text-purple-600" />
                    </div>
                    <p className="text-xs font-medium text-gray-700 mb-1">
                      Subir imagen
                    </p>
                    <p className="text-xs text-gray-500">
                      JPG, PNG • Máx 5MB
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
        )}
      </div>

      {/* Estado actual */}
      {(hasBackgroundColor || hasBackgroundImage) && (
        <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-xs font-semibold text-green-900 mb-1">✓ Aplicado:</p>
          <div className="flex flex-wrap gap-1">
            {hasBackgroundColor && (
              <span className="text-xs bg-white px-2 py-0.5 rounded-full text-green-800 flex items-center gap-1">
                <Palette size={10} />
                Color
              </span>
            )}
            {hasBackgroundImage && (
              <span className="text-xs bg-white px-2 py-0.5 rounded-full text-green-800 flex items-center gap-1">
                <Image size={10} />
                Imagen
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}