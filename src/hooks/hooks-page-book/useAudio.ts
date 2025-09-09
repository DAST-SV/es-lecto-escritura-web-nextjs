// src/hooks/useAudio.ts
import { useEffect, useRef } from "react";

/**
 * Hook para reproducir audio automáticamente
 * @param audioUrl URL del archivo de audio a reproducir
 */
export const useAudio = (audioUrl?: string) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioUrl) return;

    // Creamos el audio si no existe
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
    } else {
      audioRef.current.src = audioUrl; // Cambiamos la fuente si cambia
    }

    // Reproducimos
    audioRef.current
      .play()
      .catch(() => {
        console.warn("No se pudo reproducir el audio automáticamente");
      });

    // Cleanup: pausa y reinicia al desmontar
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [audioUrl]);
};