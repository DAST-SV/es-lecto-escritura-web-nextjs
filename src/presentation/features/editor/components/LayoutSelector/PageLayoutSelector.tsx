import React from 'react';
import { layouts } from '@/src/components/components-for-books/layouts';

interface PageLayoutSelectorProps {
  currentLayout: string;
  pageNumber: number;
  onLayoutChange: (layout: string) => void;
}

export function PageLayoutSelector({
  currentLayout,
  pageNumber,
  onLayoutChange
}: PageLayoutSelectorProps) {
  return (
    <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
      <label className="block text-sm font-bold text-gray-700 mb-3">
        🎨 Layout de página {pageNumber}:
      </label>
      <select
        value={currentLayout}
        onChange={(e) => onLayoutChange(e.target.value)}
        className="w-full p-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
      >
        {Object.keys(layouts).map(layoutName => (
          <option key={layoutName} value={layoutName}>
            {layoutName
              .replace(/Layout$/, '')
              .replace(/([A-Z])/g, ' $1')
              .trim()
            }
          </option>
        ))}
      </select>
    </div>
  );
}