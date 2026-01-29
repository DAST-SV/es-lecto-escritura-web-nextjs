/**
 * UBICACIÓN: src/presentation/features/books/components/PDFPreview/PDFPreviewMode.tsx
 * ✅ Modo lectura con soporte TTS y auto-pase de página
 */

'use client';

import React, { useMemo, useCallback, useState, useEffect } from 'react';
import HTMLFlipBook from 'react-pageflip';
import type { Page } from '@/src/core/domain/types';
import type { TTSLanguage } from '@/src/infrastructure/services/tts';
import { PreviewHeader } from './PreviewHeader';
import { ReaderControls } from './ReaderControls';
import { ReadingPageIndicator } from './ReadingPageIndicator';
import { usePreviewControls } from './usePreviewControls';
import { useBookReader, PageWithText } from '@/src/presentation/hooks/useBookReader';

interface ExtendedPage extends Page {
  extractedText?: string;
}

interface PDFPreviewModeProps {
  pages: ExtendedPage[];
  title: string;
  pdfDimensions: { width: number; height: number };
  onClose: () => void;
  onPageFlip?: (pageNumber: number) => void;
  /** Idioma actual para TTS (default: 'es') */
  language?: TTSLanguage;
  /** Habilitar controles TTS (default: true) */
  enableTTS?: boolean;
}

export function PDFPreviewMode({
  pages,
  title,
  pdfDimensions,
  onClose,
  onPageFlip,
  language = 'es',
  enableTTS = true,
}: PDFPreviewModeProps) {
  const {
    bookRef,
    showControls,
    isClient,
    isMobile,
    handleFlip,
  } = usePreviewControls({ pages, onClose });

  // Estado de página actual del libro
  const [currentBookPage, setCurrentBookPage] = useState(0);

  // Hook de lectura TTS
  const {
    isReading,
    isPaused,
    currentReadingPage,
    startReading,
    pause,
    resume,
    stop,
    setReadingRate,
    isSupported,
    isReady,
    currentRate,
  } = useBookReader({
    pages: pages.map(p => ({ id: p.id, extractedText: p.extractedText })),
    language,
    rate: 1.0,
    onPageChange: (pageIndex) => {
      // Cambiar página del flipbook cuando TTS cambia de página
      if (bookRef.current) {
        const flipBook = bookRef.current as any;
        if (flipBook.pageFlip) {
          flipBook.pageFlip().turnToPage(pageIndex);
        }
      }
    },
    onReadingComplete: () => {
      console.log('📚 Lectura del libro completada');
    },
    onError: (error) => {
      console.error('❌ Error en lectura:', error);
    },
  });

  // Manejar flip de página (manual o automático)
  const handleFlipWithCallback = useCallback((e: any) => {
    handleFlip(e);

    // Actualizar página actual del libro
    if (e?.data !== undefined) {
      setCurrentBookPage(e.data);
      onPageFlip?.(e.data);
    }
  }, [handleFlip, onPageFlip]);

  // Calcular qué páginas están visibles (para desktop)
  const visiblePages = useMemo(() => {
    if (isMobile) {
      return {
        leftPageIndex: currentBookPage,
        rightPageIndex: -1, // No hay página derecha en móvil
      };
    }

    // En desktop, se muestran 2 páginas
    // El flipbook muestra página par a la izquierda, impar a la derecha
    const leftPageIndex = currentBookPage;
    const rightPageIndex = currentBookPage + 1 < pages.length ? currentBookPage + 1 : -1;

    return { leftPageIndex, rightPageIndex };
  }, [currentBookPage, isMobile, pages.length]);

  // Memoizar páginas para evitar recreación
  const memoizedPages = useMemo(() => {
    return pages.map((page, idx) => ({
      ...page,
      key: `page-${page.id}-${idx}`,
    }));
  }, [pages]);

  // Calcular dimensiones del libro
  const bookDimensions = useMemo(() => {
    if (!isClient) return { width: 400, height: 600 };

    const padding = 20;
    const availableHeight = window.innerHeight - padding * 2 - 100; // Extra espacio para controles
    const availableWidth = window.innerWidth - padding * 2;

    let displayWidth: number;
    let displayHeight: number;

    if (isMobile) {
      const scaleByHeight = availableHeight / pdfDimensions.height;
      const scaleByWidth = availableWidth / pdfDimensions.width;
      const scale = Math.min(scaleByHeight, scaleByWidth, 1);
      displayWidth = Math.round(pdfDimensions.width * scale);
      displayHeight = Math.round(pdfDimensions.height * scale);
    } else {
      const scaleByHeight = availableHeight / pdfDimensions.height;
      const scaleByWidth = (availableWidth / 2) / pdfDimensions.width;
      const scale = Math.min(scaleByHeight, scaleByWidth, 1);
      displayWidth = Math.round(pdfDimensions.width * scale);
      displayHeight = Math.round(pdfDimensions.height * scale);
    }

    return { width: displayWidth, height: displayHeight };
  }, [isClient, isMobile, pdfDimensions]);

  // Renderizar páginas del FlipBook
  const renderPages = useCallback(() => {
    return memoizedPages.map((page) => (
      <div className="demoPage" key={page.key}>
        {page.image && (
          <img
            src={page.image}
            alt="Página"
            className="w-full h-full object-fill pointer-events-none select-none"
            draggable={false}
          />
        )}
      </div>
    ));
  }, [memoizedPages]);

  // Cleanup TTS al cerrar
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  if (!isClient) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col" style={{ zIndex: 9999 }}>
      <PreviewHeader
        title={title}
        totalPages={pages.length}
        isVisible={showControls}
        onClose={() => {
          stop(); // Detener TTS al cerrar
          onClose();
        }}
      />

      <div className="flex-1 flex items-center justify-center overflow-hidden relative">
        {/* Indicador de página de lectura */}
        <ReadingPageIndicator
          isReading={isReading}
          currentReadingPage={currentReadingPage}
          leftPageIndex={visiblePages.leftPageIndex}
          rightPageIndex={visiblePages.rightPageIndex}
          isMobile={isMobile}
          totalPages={pages.length}
        />

        <div className="relative">
          <HTMLFlipBook
            ref={bookRef}
            width={bookDimensions.width}
            height={bookDimensions.height}
            size="fixed"
            minWidth={bookDimensions.width}
            maxWidth={bookDimensions.width}
            minHeight={bookDimensions.height}
            maxHeight={bookDimensions.height}
            drawShadow={true}
            maxShadowOpacity={0.5}
            showCover={true}
            flippingTime={1000}
            usePortrait={isMobile}
            startZIndex={0}
            autoSize={false}
            startPage={0}
            clickEventForward={true}
            useMouseEvents={true}
            swipeDistance={30}
            showPageCorners={true}
            disableFlipByClick={false}
            onFlip={handleFlipWithCallback}
            className="demo-book"
            style={{}}
            mobileScrollSupport={false}
          >
            {renderPages()}
          </HTMLFlipBook>
        </div>
      </div>

      {/* Controles de lectura TTS */}
      {enableTTS && (
        <ReaderControls
          isReading={isReading}
          isPaused={isPaused}
          isSupported={isSupported}
          isReady={isReady}
          currentReadingPage={currentReadingPage}
          totalPages={pages.length}
          currentRate={currentRate}
          onStart={startReading}
          onPause={pause}
          onResume={resume}
          onStop={stop}
          onRateChange={setReadingRate}
          currentBookPage={currentBookPage}
        />
      )}
    </div>
  );
}
