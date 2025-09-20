// BookNavigation.tsx - Versión original que funciona
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BookNavigationProps {
  currentPage: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
}

const BookNavigation: React.FC<BookNavigationProps> = ({
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage
}) => {
  return (
    <>
      {/* Controles laterales izquierdos */}
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 flex flex-col gap-4">
        <button
          onClick={onPrevPage}
          disabled={currentPage === 0}
          className="bg-white/90 hover:bg-white disabled:bg-gray-300 disabled:opacity-50 p-4 rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-110 disabled:hover:scale-100"
          title="Página anterior"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      {/* Controles laterales derechos */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 flex flex-col gap-4">
        <button
          onClick={onNextPage}
          disabled={currentPage === totalPages - 1}
          className="bg-white/90 hover:bg-white disabled:bg-gray-300 disabled:opacity-50 p-4 rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-110 disabled:hover:scale-100"
          title="Página siguiente"
        >
          <ChevronRight className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      {/* Indicador de página */}
      <div className="absolute bottom-4 right-4 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-bold">
        {currentPage + 1} / {totalPages}
      </div>
    </>
  );
};

export default BookNavigation;