/**
 * UBICACIÓN: src/presentation/features/editor/components/LayoutSelector/PageLayoutSelector.tsx
 */

import React from 'react';
import { layoutRegistry, type LayoutType } from '@/src/presentation/features/layouts/registry';
import { LAYOUT_DEFINITIONS } from '@/src/presentation/features/layouts/layoutDefinitions';

// Mapeo de IDs a nombres legibles
const layoutLabels: Record<string, string> = {};
LAYOUT_DEFINITIONS.forEach(def => {
  layoutLabels[def.id] = def.name;
});

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
        {Object.keys(layoutRegistry).map(layoutName => (
          <option key={layoutName} value={layoutName}>
            {layoutLabels[layoutName as LayoutType] || layoutName}
          </option>
        ))}
      </select>
    </div>
  );
}