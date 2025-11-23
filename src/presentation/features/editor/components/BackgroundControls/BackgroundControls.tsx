/**
 * BackgroundControls - MEJORADO: Flujo claro para color + imagen
 * 
 * FLUJO CORRECTO:
 * 1. Usuario selecciona COLOR (ej: negro)
 * 2. Usuario sube IMAGEN (la imagen se pone encima del color)
 * 3. La imagen usa 'contain' → NO se recorta
 * 4. El COLOR rellena los espacios vacíos de la imagen
 * 
 * RESULTADO: Color de fondo + Imagen centrada encima
 */

import React, { useState, useEffect } from 'react';
import { Upload, Image, X, Palette, ChevronDown, ChevronUp, Info, Check } from 'lucide-react';
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
  const [colorOpen, setColorOpen] = useState(true); // ✅ Abierto por defecto
  const [imageOpen, setImageOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>('#ffffff');

  // ✅ Detectar qué tipo de background tenemos
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

  // ✅ Guardar el color seleccionado localmente
  useEffect(() => {
    if (hasBackgroundColor) {
      setSelectedColor(currentBackground);
    }
  }, [currentBackground, hasBackgroundColor]);

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

      {/* ✅ PASO A PASO: Instrucciones claras */}
      <div className="p-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <Info size={14} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-blue-900 mb-1">📋 Cómo funciona:</p>
            <ol className="text-blue-800 space-y-1">
              <li><strong>1.</strong> Elige un color de fondo (ej: negro)</li>
              <li><strong>2.</strong> Sube una imagen encima</li>
              <li><strong>3.</strong> El color rellena los espacios vacíos</li>
            </ol>
          </div>
        </div>
      </div>

      {/* ========================================
          PASO 1: Color de fondo
          ======================================== */}
      <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
        <button
          onClick={() => setColorOpen(!colorOpen)}
          className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Palette size={16} className="text-purple-600" />
            <span className="text-sm font-semibold text-gray-700">
              Paso 1: Color base
            </span>
          </div>
          <div className="flex items-center gap-2">
            {hasBackgroundColor && !hasBackgroundImage && (
              <div className="flex items-center gap-1">
                <div 
                  className="w-5 h-5 rounded border-2 border-gray-300"
                  style={{ backgroundColor: currentBackground }}
                />
                <Check size={14} className="text-green-600" />
              </div>
            )}
            {colorOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </button>

        {colorOpen && (
          <div className="px-3 pb-3 border-t border-gray-200">
            <ColorPicker
              currentColor={selectedColor}
              onColorChange={(color) => {
                setSelectedColor(color);
                onBackgroundChange(color);
              }}
              label=""
            />
            <p className="text-xs text-gray-600 mt-2 flex items-start gap-1">
              <span>💡</span>
              <span>Este color será la base. Si subes imagen, rellenará los espacios vacíos.</span>
            </p>
          </div>
        )}
      </div>

      {/* ========================================
          PASO 2: Imagen de fondo
          ======================================== */}
      <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
        <button
          onClick={() => setImageOpen(!imageOpen)}
          className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Image size={16} className="text-purple-600" />
            <span className="text-sm font-semibold text-gray-700">
              Paso 2: Imagen encima (opcional)
            </span>
          </div>
          <div className="flex items-center gap-2">
            {hasBackgroundImage && (
              <Check size={14} className="text-green-600" />
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
                    className="w-full h-full object-contain"
                    style={{ backgroundColor: selectedColor }} // ✅ Mostrar el color detrás
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
                    onChange={onBackgroundFileChange}
                    className="hidden"
                  />
                </label>

                <p className="text-xs text-green-600 flex items-start gap-1">
                  <span>✓</span>
                  <span>Imagen cargada. El color <strong>{selectedColor}</strong> rellena los espacios.</span>
                </p>
              </>
            ) : (
              <>
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
                    onChange={onBackgroundFileChange}
                    className="hidden"
                  />
                </label>

                {selectedColor !== '#ffffff' && (
                  <p className="text-xs text-green-600 flex items-start gap-1">
                    <span>✓</span>
                    <span>Ya tienes el color <strong>{selectedColor}</strong>. Sube imagen para completar.</span>
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* ========================================
          ESTADO ACTUAL
          ======================================== */}
      {hasBackground && (
        <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-xs font-semibold text-green-900 mb-1">✓ Configurado:</p>
          <div className="flex flex-wrap gap-2 items-center">
            {/* Mostrar color */}
            {selectedColor !== '#ffffff' && (
              <div className="flex items-center gap-1">
                <div 
                  className="w-4 h-4 rounded border border-gray-300"
                  style={{ backgroundColor: selectedColor }}
                />
                <span className="text-xs text-green-800 font-medium">
                  Color: {selectedColor}
                </span>
              </div>
            )}

            {/* Mostrar imagen */}
            {hasBackgroundImage && (
              <span className="text-xs bg-white px-2 py-0.5 rounded-full text-green-800 flex items-center gap-1">
                <Image size={10} />
                + Imagen encima
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}