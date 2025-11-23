import React, { useState } from 'react';
import { Palette, Check } from 'lucide-react';

interface ColorPickerProps {
  currentColor?: string;
  onColorChange: (color: string) => void;
  disabled?: boolean;
  label?: string;
}

// Colores predefinidos populares
const PRESET_COLORS = [
  { name: 'Rojo', value: '#ef4444' },
  { name: 'Naranja', value: '#f97316' },
  { name: 'Amarillo', value: '#eab308' },
  { name: 'Verde', value: '#22c55e' },
  { name: 'Azul', value: '#3b82f6' },
  { name: 'Índigo', value: '#6366f1' },
  { name: 'Púrpura', value: '#a855f7' },
  { name: 'Rosa', value: '#ec4899' },
  { name: 'Gris', value: '#6b7280' },
  { name: 'Negro', value: '#000000' },
];

export function ColorPicker({ 
  currentColor = '#ffffff', 
  onColorChange, 
  disabled = false,
  label = '🎨 Color de fondo'
}: ColorPickerProps) {
  const [customColor, setCustomColor] = useState(currentColor);
  const [showPicker, setShowPicker] = useState(false);

  const handlePresetClick = (color: string) => {
    setCustomColor(color);
    onColorChange(color);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    onColorChange(color);
  };

  return (
    <div className={`space-y-3 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Palette size={16} className="text-purple-600" />
          {label}
        </label>
        {currentColor !== '#ffffff' && (
          <button
            onClick={() => onColorChange('#ffffff')}
            className="text-xs text-red-600 hover:text-red-700 font-medium"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Colores predefinidos */}
      <div className="grid grid-cols-5 gap-2">
        {PRESET_COLORS.map((preset) => {
          const isSelected = currentColor.toLowerCase() === preset.value.toLowerCase();
          
          return (
            <button
              key={preset.value}
              onClick={() => handlePresetClick(preset.value)}
              className={`
                relative aspect-square rounded-lg border-2 transition-all hover:scale-110
                ${isSelected 
                  ? 'border-purple-600 ring-2 ring-purple-200 shadow-lg' 
                  : 'border-gray-300 hover:border-purple-400'
                }
              `}
              style={{ backgroundColor: preset.value }}
              title={preset.name}
            >
              {isSelected && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white rounded-full p-0.5">
                    <Check size={14} className="text-purple-600" strokeWidth={3} />
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selector de color personalizado */}
      <div className="space-y-2">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="w-full flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700"
        >
          <Palette size={16} />
          <span>Color personalizado</span>
          <div 
            className="ml-auto w-6 h-6 rounded border-2 border-gray-300"
            style={{ backgroundColor: customColor }}
          />
        </button>

        {showPicker && (
          <div className="p-3 bg-white border-2 border-purple-200 rounded-lg">
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={customColor}
                onChange={handleCustomColorChange}
                className="w-16 h-16 rounded cursor-pointer border-2 border-gray-300"
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={customColor}
                  onChange={(e) => {
                    setCustomColor(e.target.value);
                    if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                      onColorChange(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded font-mono text-sm uppercase"
                  placeholder="#000000"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Elige cualquier color
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preview del color actual */}
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-lg border-2 border-gray-300 shadow-inner"
            style={{ backgroundColor: currentColor }}
          />
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-700">Color actual</p>
            <p className="text-xs text-gray-500 font-mono">{currentColor.toUpperCase()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}