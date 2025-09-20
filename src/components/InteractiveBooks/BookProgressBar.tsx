// BookProgressBar.tsx - Versión simple que funciona
import React from 'react';
import { ArrowLeft, ArrowRight, Lock } from 'lucide-react';
import { Book } from './types';

interface BookProgressBarProps {
  book: Book;
  currentPage: number;
  progress: number;
  autoAdvance: boolean;
  onGoToPage: (pageIndex: number) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  onAutoAdvanceChange: (enabled: boolean) => void;
}

const BookProgressBar: React.FC<BookProgressBarProps> = ({
  book,
  currentPage,
  progress,
  autoAdvance,
  onGoToPage,
  onPrevPage,
  onNextPage,
  onAutoAdvanceChange
}) => {
  return (
    <div className="bg-white/95 backdrop-blur-sm p-6 flex-shrink-0" style={{ height: '20vh' }}>
      <div className="max-w-7xl mx-auto h-full">
        
        {/* Progreso visual */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-600">Progreso de lectura</span>
            <span className="text-sm font-bold text-purple-600">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Miniaturas y controles */}
        <div className="flex items-center justify-between gap-4">
          
          {/* Miniaturas de páginas */}
          <div className="flex gap-2 flex-1 justify-center">
            {book.pages.map((page, index) => (
              <button
                key={index}
                onClick={() => onGoToPage(index)}
                className={`w-8 h-10 rounded border-2 transition-all text-xs flex flex-col items-center justify-center ${
                  index === currentPage
                    ? 'border-purple-500 bg-purple-100 scale-110 shadow-lg'
                    : 'border-gray-200 bg-gray-50 hover:border-purple-300 hover:bg-purple-50'
                }`}
                title={page.title}
              >
                <div className="text-sm">{page.image}</div>
                {page.isLocked && (
                  <Lock className="w-2 h-2 text-red-500" />
                )}
              </button>
            ))}
          </div>

          {/* Controles de navegación */}
          <div className="flex gap-3">
            <button
              onClick={onPrevPage}
              disabled={currentPage === 0}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-400 to-pink-400 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-lg font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:hover:scale-100"
            >
              <ArrowLeft className="w-4 h-4" />
              Anterior
            </button>
            
            <button
              onClick={onNextPage}
              disabled={currentPage === book.pages.length - 1}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-400 to-blue-400 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-lg font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:hover:scale-100"
            >
              Siguiente
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Settings */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoAdvance}
                onChange={(e) => onAutoAdvanceChange(e.target.checked)}
                className="rounded"
              />
              Avance automático
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookProgressBar;