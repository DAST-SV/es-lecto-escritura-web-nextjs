// BookModal.tsx - Usando el componente FlipBook genérico con soporte móvil
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Book } from './types';
import { levelConfig, textStyles } from './constants';
import BookModalControls from './BookModalControls';
import BookNavigation from './BookNavigation';
import BookProgressBar from './BookProgressBar';
import BookPage from './BookPage';
import { useNarration } from './useNarration';
import FlipBook from './FlipBook';
import { useFlipBook } from './useFlipBook';

interface BookModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
}

const BookModal: React.FC<BookModalProps> = ({ book, isOpen, onClose }) => {
  const [autoAdvance, setAutoAdvance] = useState(true);
  
  // Hook para controlar el FlipBook
  const flipBook = useFlipBook({
    totalPages: book?.pages?.length || 0,
    enableKeyboardNavigation: isOpen, // Solo habilitar cuando el modal esté abierto
  });

  // Initialize narration hook
  const narration = useNarration({
    book,
    currentPage: flipBook.currentPage,
    autoAdvance,
    onNextPage: flipBook.nextPage
  });

  // Reset function
  const resetBook = useCallback(() => {
    flipBook.goToFirstPage();
    if (narration?.resetNarration) {
      narration.resetNarration();
    }
  }, [flipBook, narration]);

  // Reset state when book changes
  useEffect(() => {
    if (book) {
      flipBook.goToFirstPage();
      if (narration?.resetNarration) {
        narration.resetNarration();
      }
    }
  }, [book?.id]);

  // Handle keyboard navigation (adicional al del hook)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case ' ':
          e.preventDefault();
          if (narration?.toggleNarration) {
            narration.toggleNarration();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          resetBook();
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyPress);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isOpen, narration, onClose, resetBook]);

  if (!isOpen || !book) return null;

  const level = levelConfig.find(l => l.id === book.level);
  const textStyle = textStyles[level?.textSize || 'medium'];
  const progress = ((flipBook.currentPage + 1) / book.pages.length) * 100;

  // Calcular dimensiones responsive mejoradas
  const getDimensions = () => {
    if (typeof window === 'undefined') return { width: 600, height: 400 };
    
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // Móviles (hasta 768px) - optimizado para una página
    if (screenWidth <= 768) {
      return {
        width: Math.min(screenWidth * 0.9, 500), // Más ancho para una sola página
        height: Math.min(screenHeight * 0.5, 600), // Más alto para mejor lectura
      };
    }
    // Tablets (769px - 1024px)
    else if (screenWidth <= 1024) {
      return {
        width: Math.min(screenWidth * 0.75, 700),
        height: Math.min(screenHeight * 0.6, 500),
      };
    }
    // Desktop
    else {
      return {
        width: Math.min(screenWidth * 0.6, 800),
        height: Math.min(screenHeight * 0.6, 500),
      };
    }
  };

  const dimensions = getDimensions();

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
      
      {/* Header Controls */}
      <BookModalControls
        book={book}
        isPlaying={narration?.isPlaying || false}
        isMuted={narration?.isMuted || false}
        readingSpeed={narration?.readingSpeed || 1}
        onToggleNarration={narration?.toggleNarration || (() => {})}
        onToggleMute={narration?.setIsMuted || (() => {})}
        onSpeedChange={narration?.setReadingSpeed || (() => {})}
        onReset={resetBook}
        onClose={onClose}
      />

      {/* Book Container - altura adaptativa */}
      <div 
        className="flex-1 flex items-center justify-center p-4 relative" 
        style={{ 
          height: flipBook.isMobile ? '75vh' : '70vh',
          minHeight: flipBook.isMobile ? '400px' : '300px'
        }}
      >
        
        {/* Navigation Controls - Ocultar en móvil ya que el FlipBook tiene controles propios */}
        {!flipBook.isMobile && (
          <BookNavigation
            currentPage={flipBook.currentPage}
            totalPages={book.pages.length}
            onPrevPage={flipBook.prevPage}
            onNextPage={flipBook.nextPage}
          />
        )}

        {/* FlipBook genérico */}
        <div className="w-full h-full flex items-center justify-center">
          {book.pages && book.pages.length > 0 ? (
            <FlipBook
              ref={flipBook.bookRef}
              width={dimensions.width}
              height={dimensions.height}
              // Configuración específica para móvil vs desktop
              minWidth={flipBook.isMobile ? 300 : 600}
              maxWidth={flipBook.isMobile ? 500 : 900}
              minHeight={flipBook.isMobile ? 300 : 300}
              maxHeight={flipBook.isMobile ? 700 : 500}
              // Preset automático basado en dispositivo
              preset={flipBook.isMobile ? 'mobile' : 'children'}
              className="shadow-2xl"
              style={{
                // Estilo adicional para móvil
                ...(flipBook.isMobile && {
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                })
              }}
              onFlip={flipBook.onFlip}
              // Configuración adicional para móvil
              config={{
                ...(flipBook.isMobile && {
                  drawShadow: false,
                  flippingTime: 0,
                  showPageCorners: false,
                  maxShadowOpacity: 0,
                })
              }}
            >
              {book.pages.map((page, index) => (
                <BookPage
                  key={index}
                  page={page}
                  pageIndex={index}
                  textStyle={textStyle}
                  renderHighlightedText={narration?.renderHighlightedText || ((content) => <span>{content}</span>)}
                />
              ))}
            </FlipBook>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-white text-xl">Cargando libro...</p>
            </div>
          )}
        </div>

        {/* Navegación móvil adicional (opcional, por si se quiere tener botones externos) */}
        {flipBook.isMobile && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
            <button
              onClick={flipBook.prevPage}
              disabled={flipBook.isFirstPage}
              className={`px-4 py-2 rounded-lg text-white font-medium transition-all ${
                flipBook.isFirstPage 
                  ? 'bg-gray-600 opacity-50 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
              }`}
            >
              ←
            </button>
            <button
              onClick={flipBook.nextPage}
              disabled={flipBook.isLastPage}
              className={`px-4 py-2 rounded-lg text-white font-medium transition-all ${
                flipBook.isLastPage 
                  ? 'bg-gray-600 opacity-50 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
              }`}
            >
              →
            </button>
          </div>
        )}
      </div>

      {/* Progress Bar and Controls */}
      <BookProgressBar
        book={book}
        currentPage={flipBook.currentPage}
        progress={progress}
        autoAdvance={autoAdvance}
        onGoToPage={flipBook.goToPage}
        onPrevPage={flipBook.prevPage}
        onNextPage={flipBook.nextPage}
        onAutoAdvanceChange={setAutoAdvance}
      />

      {/* Overlay para cerrar haciendo clic fuera - más sensible en móvil */}
      <div 
        className="absolute inset-0 -z-10"
        onClick={onClose}
        style={{
          // En móvil, hacer el área de cierre más pequeña para evitar cierres accidentales
          ...(flipBook.isMobile && {
            top: '60px', // Dejar espacio para controles
            bottom: '100px', // Dejar espacio para progress bar
          })
        }}
      />

      {/* Instrucciones para móvil (opcional) */}
      {flipBook.isMobile && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-3 py-1 rounded text-xs opacity-75">
          Toca los lados para navegar
        </div>
      )}
    </div>
  );
};

export default BookModal;