// BookPage.tsx
import React, { forwardRef } from 'react';
import { BookPage as BookPageType } from './types';

interface BookPageProps {
  page: BookPageType;
  pageIndex: number;
  textStyle: string;
  renderHighlightedText: (content: string, words?: Array<{text: string; start: number; end: number}>) => React.ReactNode;
}

const BookPage = forwardRef<HTMLDivElement, BookPageProps>(({ 
  page, 
  pageIndex, 
  textStyle, 
  renderHighlightedText 
}, ref) => {
  return (
    <div
      ref={ref}
      className={`bg-gradient-to-br ${page.backgroundColor || 'from-white to-gray-50'} h-full flex flex-col items-center justify-center text-center p-6 relative overflow-hidden border-r border-gray-200`}
      style={{
        backgroundImage: `
          linear-gradient(to right, #f0f0f0 1px, transparent 1px),
          linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)
        `,
        backgroundSize: '20px 25px, 20px 25px',
        boxShadow: pageIndex % 2 === 0 
          ? 'inset -10px 0 10px -10px rgba(0,0,0,0.1)' 
          : 'inset 10px 0 10px -10px rgba(0,0,0,0.1)'
      }}
    >
      {page.isLocked ? (
        <div className="flex flex-col items-center justify-center h-full px-4">
          <div className="text-6xl mb-6 animate-bounce">{page.image || '🔒'}</div>
          <h3 className="text-xl font-black text-red-600 mb-4 leading-tight">¡Contenido Premium!</h3>
          <p className="text-sm text-gray-700 mb-6 max-w-xs leading-relaxed">
            Para continuar esta increíble historia, únete a nuestra familia de lectores.
          </p>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button className="bg-gradient-to-r from-blue-400 to-purple-500 text-white px-4 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all text-sm">
              Ver Planes
            </button>
            <button className="border-2 border-blue-400 text-blue-600 px-4 py-3 rounded-xl font-bold hover:bg-blue-50 transform hover:scale-105 transition-all text-sm">
              Prueba Gratis
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full px-4">
          <div className="text-6xl mb-6 animate-pulse">{page.image || '📖'}</div>
          <h3 className="text-lg font-bold mb-4 text-gray-800 leading-tight max-w-sm">{page.title || ''}</h3>
          <p className={`text-gray-700 ${textStyle} text-center max-w-sm leading-relaxed`}>
            {renderHighlightedText(page.content || '', page.words)}
          </p>
        </div>
      )}
    </div>
  );
});

BookPage.displayName = 'BookPage';

export default BookPage;