/**
 * UBICACIÓN: src/presentation/features/books/components/PDFPreview/PreviewHeader.tsx
 * Header minimalista: [×] [Título  •  pág] [Audio]
 * Badge de idioma y controles de zoom viven en la barra inferior.
 */

import React from 'react';
import { X } from 'lucide-react';
import { AudioControls } from './AudioControls';

interface PreviewHeaderProps {
  title: string;
  totalPages: number;
  isVisible: boolean;
  onClose: () => void;
  // Props de audio (opcionales)
  audioProps?: {
    isReading: boolean;
    isPaused: boolean;
    isSupported: boolean;
    isReady: boolean;
    currentReadingPage: number;
    currentRate: number;
    onStart: (fromPage?: number) => void;
    onPause: () => void;
    onResume: () => void;
    onStop: () => void;
    onRateChange: (rate: number) => void;
    currentBookPage: number;
  };
}

export function PreviewHeader({
  title,
  totalPages,
  isVisible,
  onClose,
  audioProps,
}: PreviewHeaderProps) {
  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[10000] transition-all duration-300 pointer-events-none ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.72), transparent)',
        paddingBottom: 18,
      }}
    >
      <div className="flex items-center gap-2 px-3 pt-2 pb-1">
        {/* Cerrar */}
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1.5 bg-black/40 hover:bg-black/60 backdrop-blur-sm
            text-white rounded-md transition-all pointer-events-auto"
          title="Salir (ESC)"
        >
          <X size={14} />
        </button>

        {/* Título truncado */}
        <span
          className="text-white text-xs sm:text-sm font-medium pointer-events-auto
            select-text cursor-text truncate max-w-[140px] sm:max-w-sm"
        >
          {title || 'Sin título'}
        </span>

        {/* Controles de audio */}
        {audioProps && (
          <>
            <div className="w-px h-4 bg-white/20 mx-0.5 flex-shrink-0" />
            <AudioControls
              isReading={audioProps.isReading}
              isPaused={audioProps.isPaused}
              isSupported={audioProps.isSupported}
              isReady={audioProps.isReady}
              currentReadingPage={audioProps.currentReadingPage}
              totalPages={totalPages}
              currentRate={audioProps.currentRate}
              onStart={audioProps.onStart}
              onPause={audioProps.onPause}
              onResume={audioProps.onResume}
              onStop={audioProps.onStop}
              onRateChange={audioProps.onRateChange}
              currentBookPage={audioProps.currentBookPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
