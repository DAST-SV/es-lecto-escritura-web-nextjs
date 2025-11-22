import React from 'react';
import { backgrounds } from '@/src/typings/types-page-book/backgrounds';

interface BackgroundControlsProps {
  currentBackground: string | null | undefined;
  hasBackground: boolean;
  pageNumber: number;
  onBackgroundChange: (value: string) => void;
  onBackgroundFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveBackground: () => void;
}

export function BackgroundControls({
  currentBackground,
  hasBackground,
  pageNumber,
  onBackgroundChange,
  onBackgroundFileChange,
  onRemoveBackground
}: BackgroundControlsProps) {
  return (
    <div className="mb-6 p-4 bg-purple-50 rounded-lg">
      <label className="block text-sm font-bold text-gray-700 mb-3">
        🎨 Fondo de página {pageNumber}:
      </label>
      
      <select
        value={currentBackground || ""}
        onChange={(e) => onBackgroundChange(e.target.value)}
        className="w-full mb-3 p-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
      >
        <option value="">Sin fondo (blanco)</option>
        {Object.keys(backgrounds)
          .filter(k => k !== 'blanco')
          .map(key => (
            <option key={key} value={key}>{key}</option>
          ))}
      </select>

      <input
        key={`${pageNumber}-background`}
        type="file"
        accept="image/*"
        onChange={onBackgroundFileChange}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 cursor-pointer mb-3"
      />

      {hasBackground && (
        <button
          onClick={onRemoveBackground}
          className="w-full p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium transition-colors"
        >
          🗑 Quitar Fondo
        </button>
      )}
    </div>
  );
}