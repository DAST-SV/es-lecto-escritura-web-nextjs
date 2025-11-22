import React from 'react';

interface ImageControlsProps {
  hasImage: boolean;
  pageNumber: number;
  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
}

export function ImageControls({
  hasImage,
  pageNumber,
  onImageChange,
  onRemoveImage
}: ImageControlsProps) {
  return (
    <div className="mb-6 p-4 bg-green-50 rounded-lg">
      <label className="block text-sm font-bold text-gray-700 mb-3">
        🖼 Imagen de página {pageNumber}:
      </label>

      <input
        key={`${pageNumber}-img`}
        type="file"
        accept="image/*"
        onChange={onImageChange}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-100 file:text-green-700 hover:file:bg-green-200 cursor-pointer mb-3"
      />

      {hasImage && (
        <button
          onClick={onRemoveImage}
          className="w-full p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium transition-colors"
        >
          🗑 Quitar Imagen
        </button>
      )}
    </div>
  );
}