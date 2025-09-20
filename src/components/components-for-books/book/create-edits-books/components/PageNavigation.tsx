import React from 'react';

interface PageNavigationProps {
  currentPage: number;
  totalPages: number;
  canGoNext: boolean;
  canGoPrev: boolean;
  isFlipping: boolean;
  onGoToPage: (pageIndex: number) => void;
  onNextPage: () => void;
  onPrevPage: () => void;
  onAddPage: () => void;
  onDeletePage: () => void;
}

export const PageNavigation: React.FC<PageNavigationProps> = ({
  currentPage,
  totalPages,
  canGoNext,
  canGoPrev,
  isFlipping,
  onGoToPage,
  onNextPage,
  onPrevPage,
  onAddPage,
  onDeletePage
}) => {
  const canDeletePage = totalPages > 2;

  return (
    <div className="space-y-3 pt-4">
      {/* Selector de página */}
      <select
        value={currentPage}
        onChange={(e) => onGoToPage(parseInt(e.target.value))}
        className="w-full p-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        disabled={isFlipping}
      >
        {Array.from({ length: totalPages }, (_, index) => (
          <option key={index} value={index}>
            Página {index + 1}
          </option>
        ))}
      </select>

      {/* Botones de navegación */}
      <div className="flex gap-2">
        <button
          onClick={onPrevPage}
          disabled={!canGoPrev}
          className="flex-1 p-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed font-medium transition-all"
        >
          ← Anterior
        </button>
        <button
          onClick={onNextPage}
          disabled={!canGoNext}
          className="flex-1 p-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed font-medium transition-all"
        >
          Siguiente →
        </button>
      </div>

      {/* Botones de gestión de páginas */}
      <button
        onClick={onAddPage}
        className="w-full p-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 font-medium transition-all"
      >
        + Agregar Página Nueva
      </button>

      {canDeletePage && (
        <button
          onClick={onDeletePage}
          className="w-full p-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 font-medium transition-all"
        >
          🗑 Eliminar Página Actual
        </button>
      )}
    </div>
  );
};