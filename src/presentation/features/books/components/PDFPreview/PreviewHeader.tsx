/**
 * UBICACIÓN: src/presentation/features/books/components/PDFPreview/PreviewHeader.tsx
 * Header: Título izquierda + Controles de audio discretos + Botón Cerrar
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
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)',
        padding: '8px 12px'
      }}
    >
      <div className="flex items-center justify-between">
        {/* Izquierda: Cerrar + Título + Audio */}
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-1.5 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white rounded-md transition-all pointer-events-auto"
            title="Salir (ESC)"
          >
            <X size={14} />
          </button>
          <span className="text-white text-xs sm:text-sm font-medium pointer-events-auto select-text cursor-text">
            {title || 'Sin título'}
          </span>
          <span className="text-white/50 text-xs pointer-events-auto select-text cursor-text">
            • {totalPages} pág.
          </span>

          {/* Separador + Controles de audio discretos */}
          {audioProps && (
            <>
              <div className="w-px h-4 bg-white/20 mx-1" />
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

        {/* Derecha: Vacío */}
        <div />
      </div>
    </div>
  );
}