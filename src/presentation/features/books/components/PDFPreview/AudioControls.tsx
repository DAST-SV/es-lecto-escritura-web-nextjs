/**
 * UBICACIÓN: src/presentation/features/books/components/PDFPreview/AudioControls.tsx
 * ✅ Controles de audio discretos junto al título
 * - Icono minimalista que expande opciones
 * - Opción de fijar el panel
 * - Estilo consistente con HomePage
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, Square, ChevronDown, Pin, PinOff } from 'lucide-react';

interface AudioControlsProps {
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
  /** Página actual del libro */
  currentBookPage: number;
}

export function AudioControls({
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
}: AudioControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Cerrar panel al hacer clic fuera (solo si no está fijado)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!isPinned && panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded && !isPinned) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isExpanded, isPinned]);

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
      onStart(currentBookPage);
    } else if (isPaused) {
      onResume();
    } else {
      onPause();
    }
  };

  const togglePanel = () => {
    setIsExpanded(!isExpanded);
  };

  const togglePin = () => {
    setIsPinned(!isPinned);
  };

  return (
    <div ref={panelRef} className="relative pointer-events-auto">
      {/* Botón principal - icono discreto */}
      <button
        onClick={togglePanel}
        disabled={!isReady}
        className={`
          flex items-center gap-1.5 px-2 py-1 rounded-md transition-all
          ${isReady
            ? 'hover:bg-white/20 text-white/80 hover:text-white'
            : 'text-white/30 cursor-not-allowed'
          }
          ${isReading && !isPaused ? 'text-amber-400' : ''}
        `}
        title={isReading ? (isPaused ? 'Audio pausado' : 'Reproduciendo...') : 'Escuchar libro'}
      >
        {isReading && !isPaused ? (
          <Volume2 size={16} className="animate-pulse" />
        ) : (
          <VolumeX size={16} />
        )}
        <ChevronDown
          size={12}
          className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Panel expandido */}
      {isExpanded && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-slate-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700 overflow-hidden z-50">
          {/* Header del panel */}
          <div className="px-3 py-2 border-b border-slate-700/50 flex items-center justify-between">
            <span className="text-xs font-medium text-white/70">Lectura en voz alta</span>
            <button
              onClick={togglePin}
              className={`p-1 rounded transition-colors ${
                isPinned
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'hover:bg-white/10 text-white/50 hover:text-white'
              }`}
              title={isPinned ? 'Desfijar panel' : 'Fijar panel'}
            >
              {isPinned ? <Pin size={12} /> : <PinOff size={12} />}
            </button>
          </div>

          {/* Controles principales */}
          <div className="p-3 space-y-3">
            {/* Play/Pause/Stop */}
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={handlePlayPause}
                disabled={!isReady}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-all
                  ${isReady
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-lg hover:shadow-amber-500/30'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }
                `}
              >
                {!isReading || isPaused ? (
                  <Play size={18} className="ml-0.5" />
                ) : (
                  <Pause size={18} />
                )}
              </button>

              {isReading && (
                <button
                  onClick={onStop}
                  className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-700 hover:bg-slate-600 text-white transition-colors"
                  title="Detener"
                >
                  <Square size={14} />
                </button>
              )}
            </div>

            {/* Indicador de página */}
            {isReading && (
              <div className="text-center text-sm">
                <span className="text-amber-400 font-medium">
                  Página {currentReadingPage + 1}
                </span>
                <span className="text-white/50"> de {totalPages}</span>
              </div>
            )}

            {/* Velocidad */}
            <div>
              <label className="text-[10px] text-white/50 block mb-1.5 uppercase tracking-wide">
                Velocidad
              </label>
              <div className="grid grid-cols-3 gap-1">
                {speeds.map((speed) => (
                  <button
                    key={speed.value}
                    onClick={() => onRateChange(speed.value)}
                    className={`
                      px-2 py-1.5 rounded text-xs font-medium transition-all
                      ${currentRate === speed.value
                        ? 'bg-amber-500 text-slate-900'
                        : 'bg-slate-700/50 text-white/70 hover:bg-slate-600 hover:text-white'
                      }
                    `}
                  >
                    {speed.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Estado */}
            {!isReady && (
              <div className="text-center py-2">
                <span className="text-[10px] text-white/40">Cargando voces...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
