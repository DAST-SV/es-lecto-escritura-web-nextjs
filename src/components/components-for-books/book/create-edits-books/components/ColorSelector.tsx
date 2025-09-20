import React from 'react';
import { textColors } from '@/src/typings/types-page-book/textColors ';
import {textColorstype} from '@/src/typings/types-page-book/index'

interface ColorSelectorProps {
  currentColor: string | null | undefined;
  pageNumber: number;
  onColorChange: (color: string) => void;
}

export const ColorSelector: React.FC<ColorSelectorProps> = ({
  currentColor,
  pageNumber,
  onColorChange
}) => {
  const selectedColor = currentColor || "negro";
  const colorValue = selectedColor in textColors 
    ? textColors[selectedColor as keyof typeof textColors] 
    : textColors.negro;

  return (
    <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
      <label className="block text-sm font-bold text-gray-700 mb-3">
        🎨 Color de texto página {pageNumber}:
      </label>
      
      <select
        value={selectedColor}
        onChange={(e) => onColorChange(e.target.value)}
        className="w-full p-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 mb-3"
      >
        {Object.keys(textColors).map(colorName => (
          <option key={colorName} value={colorName}>
            {colorName.charAt(0).toUpperCase() + colorName.slice(1)}
          </option>
        ))}
      </select>

      {/* Preview del color seleccionado */}
      <div 
        className="p-2 rounded border text-center font-medium"
        style={{
          backgroundColor: '#f9f9f9',
          color: colorValue
        }}
      >
        Vista previa del color de texto
      </div>
    </div>
  );
};