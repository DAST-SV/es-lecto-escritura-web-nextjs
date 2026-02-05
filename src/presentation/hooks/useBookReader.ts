/**
 * UBICACIÓN: src/presentation/hooks/useBookReader.ts
 * ✅ Hook para lectura de libros con TTS y auto-pase de página
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { ttsService, TTSLanguage } from '@/src/infrastructure/services/tts';

export interface PageWithText {
  id: string;
  extractedText?: string;
}

export interface UseBookReaderOptions {
  /** Páginas del libro con texto extraído */
  pages: PageWithText[];
  /** Idioma actual de lectura */
  language: TTSLanguage;
  /** Velocidad de lectura (0.5 - 2.0) */
  rate?: number;
  /** Callback cuando se debe cambiar de página */
  onPageChange?: (pageIndex: number) => void;
  /** Callback cuando termina de leer todo el libro */
  onReadingComplete?: () => void;
  /** Callback cuando hay error */
  onError?: (error: string) => void;
}

export interface UseBookReaderReturn {
  /** Si está leyendo actualmente */
  isReading: boolean;
  /** Si está pausado */
  isPaused: boolean;
  /** Página actual siendo leída (índice) */
  currentReadingPage: number;
  /** Inicia la lectura desde la página actual */
  startReading: (fromPage?: number) => void;
  /** Pausa la lectura */
  pause: () => void;
  /** Reanuda la lectura */
  resume: () => void;
  /** Detiene completamente la lectura */
  stop: () => void;
  /** Cambia la velocidad de lectura */
  setReadingRate: (rate: number) => void;
  /** Si TTS está soportado */
  isSupported: boolean;
  /** Si TTS está listo */
  isReady: boolean;
  /** Voces disponibles para el idioma actual */
  availableVoices: { name: string; lang: string }[];
  /** Velocidad actual */
  currentRate: number;
}

export function useBookReader({
  pages,
  language,
  rate: initialRate = 1.0,
  onPageChange,
  onReadingComplete,
  onError,
}: UseBookReaderOptions): UseBookReaderReturn {
  // Estados
  const [isReading, setIsReading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentReadingPage, setCurrentReadingPage] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [currentRate, setCurrentRate] = useState(initialRate);

  // Refs para evitar closures stale
  const pagesRef = useRef(pages);
  const currentPageRef = useRef(currentReadingPage);
  const isReadingRef = useRef(isReading);

  // Actualizar refs cuando cambian los valores
  useEffect(() => {
    pagesRef.current = pages;
  }, [pages]);

  useEffect(() => {
    currentPageRef.current = currentReadingPage;
  }, [currentReadingPage]);

  useEffect(() => {
    isReadingRef.current = isReading;
  }, [isReading]);

  // Inicializar TTS
  useEffect(() => {
    const initTTS = async () => {
      const ready = await ttsService.waitForReady();
      setIsReady(ready);

      if (!ready) {
        console.warn('⚠️ TTS no está disponible en este navegador');
      }
    };

    initTTS();

    // Cleanup al desmontar
    return () => {
      ttsService.stop();
    };
  }, []);

  // Función para leer una página específica
  const readPage = useCallback(
    (pageIndex: number) => {
      const currentPages = pagesRef.current;

      if (pageIndex < 0 || pageIndex >= currentPages.length) {
        console.log('📖 Lectura completa - fin del libro');
        setIsReading(false);
        setIsPaused(false);
        onReadingComplete?.();
        return;
      }

      const page = currentPages[pageIndex];
      const text = page.extractedText || '';

      if (!text || text.trim().length === 0) {
        console.log(`📖 Página ${pageIndex + 1} sin texto, pasando a la siguiente...`);
        // Si no hay texto, pasar a la siguiente página después de un breve delay
        setTimeout(() => {
          if (isReadingRef.current) {
            const nextPage = pageIndex + 1;
            setCurrentReadingPage(nextPage);
            onPageChange?.(nextPage);
            readPage(nextPage);
          }
        }, 500);
        return;
      }

      console.log(`📖 Leyendo página ${pageIndex + 1}/${currentPages.length}`);

      ttsService.speak(
        text,
        {
          language,
          rate: currentRate,
        },
        {
          onStart: () => {
            console.log(`🔊 Iniciando lectura de página ${pageIndex + 1}`);
          },
          onEnd: () => {
            console.log(`✅ Terminó página ${pageIndex + 1}`);

            if (!isReadingRef.current) return;

            // Pasar a la siguiente página
            const nextPage = pageIndex + 1;

            if (nextPage < currentPages.length) {
              // Pequeño delay antes de cambiar de página para dar tiempo a la animación
              setTimeout(() => {
                if (isReadingRef.current) {
                  setCurrentReadingPage(nextPage);
                  onPageChange?.(nextPage);

                  // Esperar a que la animación de flip termine antes de leer
                  setTimeout(() => {
                    if (isReadingRef.current) {
                      readPage(nextPage);
                    }
                  }, 1200); // Tiempo de animación del flip
                }
              }, 300);
            } else {
              // Fin del libro
              setIsReading(false);
              setIsPaused(false);
              onReadingComplete?.();
            }
          },
          onError: (error) => {
            console.error('❌ Error TTS:', error);
            setIsReading(false);
            setIsPaused(false);
            onError?.(error);
          },
        }
      );
    },
    [language, currentRate, onPageChange, onReadingComplete, onError]
  );

  // Iniciar lectura
  const startReading = useCallback(
    (fromPage: number = 0) => {
      if (!isReady) {
        onError?.('TTS no está listo');
        return;
      }

      const startPage = Math.max(0, Math.min(fromPage, pages.length - 1));

      console.log(`📖 Iniciando lectura desde página ${startPage + 1}`);

      setIsReading(true);
      setIsPaused(false);
      setCurrentReadingPage(startPage);
      isReadingRef.current = true;

      readPage(startPage);
    },
    [isReady, pages.length, readPage, onError]
  );

  // Pausar lectura
  const pause = useCallback(() => {
    if (isReading && !isPaused) {
      ttsService.pause();
      setIsPaused(true);
      console.log('⏸️ Lectura pausada');
    }
  }, [isReading, isPaused]);

  // Reanudar lectura
  const resume = useCallback(() => {
    if (isReading && isPaused) {
      ttsService.resume();
      setIsPaused(false);
      console.log('▶️ Lectura reanudada');
    }
  }, [isReading, isPaused]);

  // Detener lectura
  const stop = useCallback(() => {
    ttsService.stop();
    setIsReading(false);
    setIsPaused(false);
    isReadingRef.current = false;
    console.log('⏹️ Lectura detenida');
  }, []);

  // Cambiar velocidad
  const setReadingRate = useCallback(
    (rate: number) => {
      const clampedRate = Math.max(0.5, Math.min(2.0, rate));
      setCurrentRate(clampedRate);

      // Si está leyendo, reiniciar con la nueva velocidad después de un pequeño delay
      if (isReading && !isPaused) {
        // Guardar el estado antes de detener
        const wasReading = isReadingRef.current;
        const currentPage = currentPageRef.current;

        ttsService.stop();

        // Pequeño delay para evitar race conditions
        setTimeout(() => {
          if (wasReading) {
            isReadingRef.current = true;
            readPage(currentPage);
          }
        }, 100);
      }
    },
    [isReading, isPaused, readPage]
  );

  // Obtener voces disponibles
  const availableVoices = isReady ? ttsService.getVoicesForLanguage(language) : [];

  return {
    isReading,
    isPaused,
    currentReadingPage,
    startReading,
    pause,
    resume,
    stop,
    setReadingRate,
    isSupported: ttsService.isSupported(),
    isReady,
    availableVoices,
    currentRate,
  };
}
