/**
 * UBICACIÓN: src/presentation/features/books/components/PDFPreview/ReaderControls.tsx
 * ✅ Controles de lectura TTS para el visor de libros
 */

'use client';

import React, { useState } from 'react';
import { Play, Pause, Square, Volume2, VolumeX, Settings } from 'lucide-react';

interface ReaderControlsProps {
  /** Si está leyendo */
  isReading: boolean;
  /** Si está pausado */
  isPaused: boolean;
  /** Si TTS está disponible */
  isSupported: boolean;
  /** Si TTS está listo */
  isReady: boolean;
  /** Página actual de lectura */
  currentReadingPage: number;
  /** Total de páginas */
  totalPages: number;
  /** Velocidad actual */
  currentRate: number;
  /** Iniciar lectura */
  onStart: (fromPage?: number) => void;
  /** Pausar lectura */
  onPause: () => void;
  /** Reanudar lectura */
  onResume: () => void;
  /** Detener lectura */
  onStop: () => void;
  /** Cambiar velocidad */
  onRateChange: (rate: number) => void;
  /** Página actual del libro (para iniciar desde ahí) */
  currentBookPage: number;
}

export function ReaderControls({
  isReading,
  isPaused,
  isSupported,
  isReady,
  currentReadingPage,
  totalPages,
  currentRate,
  onStart,
  onPause,
  onResume,
  onStop,
  onRateChange,
  currentBookPage,
}: ReaderControlsProps) {
  const [showSettings, setShowSettings] = useState(false);

  // Si TTS no está soportado, no mostrar controles
  if (!isSupported) {
    return null;
  }

  const speeds = [
    { value: 0.5, label: '0.5x' },
    { value: 0.75, label: '0.75x' },
    { value: 1.0, label: '1x' },
    { value: 1.25, label: '1.25x' },
    { value: 1.5, label: '1.5x' },
    { value: 2.0, label: '2x' },
  ];

  const handlePlayPause = () => {
    if (!isReading) {
      // Iniciar desde la página actual del libro
      onStart(currentBookPage);
    } else if (isPaused) {
      onResume();
    } else {
      onPause();
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-slate-900/95 backdrop-blur-md rounded-full px-4 py-3 flex items-center gap-3 shadow-2xl border border-slate-700">
        {/* Botón Play/Pause */}
        <button
          onClick={handlePlayPause}
          disabled={!isReady}
          className={`
            w-12 h-12 rounded-full flex items-center justify-center
            transition-all duration-200
            ${isReady
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-900'
              : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }
          `}
          title={!isReading ? 'Leer en voz alta' : isPaused ? 'Reanudar' : 'Pausar'}
        >
          {!isReading || isPaused ? (
            <Play className="w-6 h-6 ml-0.5" />
          ) : (
            <Pause className="w-6 h-6" />
          )}
        </button>

        {/* Botón Stop (solo visible cuando está leyendo) */}
        {isReading && (
          <button
            onClick={onStop}
            className="w-10 h-10 rounded-full flex items-center justify-center
                       bg-slate-700 hover:bg-slate-600 text-white transition-colors"
            title="Detener"
          >
            <Square className="w-5 h-5" />
          </button>
        )}

        {/* Indicador de página actual */}
        {isReading && (
          <div className="text-white text-sm px-3 border-l border-slate-600">
            <span className="text-amber-400 font-medium">
              Página {currentReadingPage + 1}
            </span>
            <span className="text-slate-400"> / {totalPages}</span>
          </div>
        )}

        {/* Botón de configuración (velocidad) */}
        <div className="relative">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-10 h-10 rounded-full flex items-center justify-center
                       bg-slate-700 hover:bg-slate-600 text-white transition-colors"
            title="Configuración de velocidad"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Panel de velocidad */}
          {showSettings && (
            <div className="absolute bottom-full mb-2 right-0 bg-slate-800 rounded-lg p-3 shadow-xl border border-slate-600 min-w-[160px]">
              <div className="text-xs text-slate-400 mb-2 font-medium">
                Velocidad de lectura
              </div>
              <div className="flex flex-wrap gap-1">
                {speeds.map((speed) => (
                  <button
                    key={speed.value}
                    onClick={() => {
                      onRateChange(speed.value);
                      setShowSettings(false);
                    }}
                    className={`
                      px-3 py-1.5 rounded text-sm transition-colors
                      ${currentRate === speed.value
                        ? 'bg-amber-500 text-slate-900 font-medium'
                        : 'bg-slate-700 text-white hover:bg-slate-600'
                      }
                    `}
                  >
                    {speed.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Indicador de volumen */}
        <div className="text-slate-400 pl-2 border-l border-slate-600">
          {isReading && !isPaused ? (
            <Volume2 className="w-5 h-5 text-amber-400 animate-pulse" />
          ) : (
            <VolumeX className="w-5 h-5" />
          )}
        </div>
      </div>

      {/* Indicador de carga */}
      {!isReady && isSupported && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          <span className="text-xs text-slate-400 bg-slate-800/90 px-3 py-1 rounded-full">
            Cargando voces...
          </span>
        </div>
      )}
    </div>
  );
}
