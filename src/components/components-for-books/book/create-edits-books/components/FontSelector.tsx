import React from 'react';
import { HtmlFontFamilies } from '@/src/typings/types-page-book/HtmlFontFamilies';

interface FontSelectorProps {
  currentFont: string;
  pageNumber: number;
  onFontChange: (font: string) => void;
}

export const FontSelector: React.FC<FontSelectorProps> = ({
  currentFont,
  pageNumber,
  onFontChange
}) => {
  return (
    <div className="mb-6 p-4 bg-orange-50 rounded-lg">
      <label className="block text-sm font-bold text-gray-700 mb-3">
        🔤 Fuente de página {pageNumber}:
      </label>

      <select
        value={currentFont || "Arial"}
        onChange={(e) => onFontChange(e.target.value)}
        className="w-full p-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
      >
        {Object.keys(HtmlFontFamilies).map(fontName => (
          <option key={fontName} value={fontName}>
            {fontName}
          </option>
        ))}
      </select>
    </div>
  );
};