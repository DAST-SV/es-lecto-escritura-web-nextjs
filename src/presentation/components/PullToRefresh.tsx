/**
 * Pull-to-Refresh nativo para mobile
 * @file src/presentation/components/PullToRefresh.tsx
 * @description Deslizar hacia abajo desde el top para recargar la pagina.
 * Ligero: solo touch events + CSS transforms, sin librerias externas.
 * Solo activo en mobile (< 768px). No interfiere con scroll normal.
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { RotateCw } from 'lucide-react';

// Configuracion
const THRESHOLD = 80;       // px que hay que arrastrar para activar el refresh
const MAX_PULL = 120;       // px maximo de pull visual
const RESISTANCE = 0.4;     // factor de resistencia (como goma elastica)

export function PullToRefresh() {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const touchStartY = useRef(0);
  const isPulling = useRef(false);

  // Solo activar en mobile
  const isMobile = useRef(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    isMobile.current = window.innerWidth < 768;
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!isMobile.current) return;
    // Solo iniciar pull si estamos arriba del todo
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    if (scrollTop <= 0) {
      touchStartY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPulling.current || isRefreshing || !isMobile.current) return;

    const touchY = e.touches[0].clientY;
    const diff = touchY - touchStartY.current;

    // Solo hacia abajo
    if (diff <= 0) {
      if (isVisible) {
        setPullDistance(0);
        setIsVisible(false);
      }
      return;
    }

    // Verificar que seguimos arriba del todo
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    if (scrollTop > 0) {
      isPulling.current = false;
      setPullDistance(0);
      setIsVisible(false);
      return;
    }

    // Prevenir scroll nativo del browser mientras hacemos pull
    e.preventDefault();

    // Aplicar resistencia (como goma elastica — se hace mas dificil a medida que jalas)
    const pulled = Math.min(diff * RESISTANCE, MAX_PULL);
    setPullDistance(pulled);
    setIsVisible(true);
  }, [isRefreshing, isVisible]);

  const handleTouchEnd = useCallback(() => {
    if (!isPulling.current || !isMobile.current) return;
    isPulling.current = false;

    if (pullDistance >= THRESHOLD * RESISTANCE && !isRefreshing) {
      // Activar refresh
      setIsRefreshing(true);
      setPullDistance(THRESHOLD * RESISTANCE); // Mantener en posicion de refresh

      // Recargar la pagina
      setTimeout(() => {
        window.location.reload();
      }, 400);
    } else {
      // Volver a posicion original
      setPullDistance(0);
      setTimeout(() => setIsVisible(false), 200);
    }
  }, [pullDistance, isRefreshing]);

  // Registrar event listeners
  useEffect(() => {
    if (typeof window === 'undefined') return;

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  // No renderizar nada si no hay pull activo
  if (!isVisible && pullDistance === 0) return null;

  const progress = Math.min(pullDistance / (THRESHOLD * RESISTANCE), 1);
  const rotation = isRefreshing ? 0 : progress * 360;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] flex justify-center pointer-events-none"
      style={{
        transform: `translateY(${pullDistance - 20}px)`,
        transition: isPulling.current ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: progress,
      }}
    >
      <div
        className={`
          w-9 h-9 rounded-full flex items-center justify-center
          shadow-lg backdrop-blur-sm
          ${isRefreshing
            ? 'bg-blue-500 text-white'
            : 'bg-white/90 text-gray-600'
          }
        `}
        style={{
          transform: `scale(${0.5 + progress * 0.5})`,
          transition: isPulling.current ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div
          style={{
            transform: isRefreshing ? undefined : `rotate(${rotation}deg)`,
            animation: isRefreshing ? 'ptr-spin 0.6s linear infinite' : 'none',
          }}
        >
          <RotateCw size={18} strokeWidth={2.5} />
        </div>
      </div>

      {/* Keyframe inline para el spin — evita necesitar globals.css */}
      <style>{`
        @keyframes ptr-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
