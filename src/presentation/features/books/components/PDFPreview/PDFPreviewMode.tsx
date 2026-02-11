/**
 * UBICACIÓN: src/presentation/features/books/components/PDFPreview/PDFPreviewMode.tsx
 *
 * MODO LECTURA
 *   · Flechas ← → (o teclado) → pasar página
 *   · Tap lateral invisible en móvil
 *   · + / - teclado (numérico o Ctrl+rueda) → entra a zoom mode
 *
 * MODO ZOOM  (lupa amarilla)
 *   · El flipbook se remonta con showPageCorners=false → sin animación de esquinas
 *   · Pan con mouse drag (desktop) o 1 dedo (móvil)
 *   · Pinch 2 dedos → zoom centrado en el midpoint (CSS transform, sin remount)
 *   · Wheel del mouse → zoom centrado en posición del cursor
 *   · Click → zoom centrado en punto clickeado
 *   · Botones +/− del pill → zoom discreto desde centro
 *   · + / - / Ctrl+scroll → zoom
 *   · Flechas ← → ↑ ↓ → pan con teclado (NO pasan página)
 *   · Zoom 1× + flechas → sigue pasando página (nunca hizo pan)
 *   · Bounds: el libro nunca sale de la vista. Rebote suave al soltar.
 *
 * TÍTULO: se toma del prop en tiempo real (no hay stale porque key={activeTab})
 *
 * PILL flotante (fixed, esquina inferior derecha, no roba espacio al libro):
 *   [−] [+] [🔍] | [ES]
 */

'use client';

import React, {
  useMemo, useCallback, useState, useEffect, useRef, useLayoutEffect,
} from 'react';
import HTMLFlipBook from 'react-pageflip';
import type { Page } from '@/src/core/domain/types';
import type { TTSLanguage } from '@/src/infrastructure/services/tts';
import { PreviewHeader } from './PreviewHeader';
import { ReadingPageIndicator } from './ReadingPageIndicator';
import { usePreviewControls } from './usePreviewControls';
import { useBookReader } from '@/src/presentation/hooks/useBookReader';
import { ZoomIn, ZoomOut, Search } from 'lucide-react';

interface ExtendedPage extends Page { extractedText?: string; }

interface PDFPreviewModeProps {
  pages: ExtendedPage[];
  title: string;
  pdfDimensions: { width: number; height: number };
  onClose: () => void;
  onPageFlip?: (pageNumber: number) => void;
  language?: TTSLanguage;
  enableTTS?: boolean;
}

const LANG_LABELS: Record<string, string> = {
  es: 'ES', en: 'EN', fr: 'FR', pt: 'PT',
  de: 'DE', it: 'IT', ca: 'CA', eu: 'EU', gl: 'GL',
};

const ZOOM_STEP  = 0.35;
const ZOOM_MIN   = 1.0;
const ZOOM_MAX   = 4.0;
const HEADER_H   = 46;
const PAN_ARROW  = 80; // px por pulsación de flecha en zoom mode

// ── Rubber-band: resistencia al sobrepasar el límite durante gestos ──
// Solo 30% del exceso se traslada al pan → sensación de "muesca"
function rubberBandVal(val: number, maxAbs: number): number {
  if (Math.abs(val) <= maxAbs) return val;
  const excess = Math.abs(val) - maxAbs;
  const damped  = maxAbs + excess * 0.3;
  return val > 0 ? damped : -damped;
}

export function PDFPreviewMode({
  pages, title, pdfDimensions, onClose, onPageFlip,
  language = 'es', enableTTS = true,
}: PDFPreviewModeProps) {
  // ── usePreviewControls: bookRef, showControls, isMobile, isClient ─
  const { bookRef, showControls, isClient, isMobile, handleFlip } =
    usePreviewControls({ pages, onClose });

  const [currentBookPage, setCurrentBookPage] = useState(0);

  // ── Zoom: estado ─────────────────────────────────────────────────
  const [isZoomMode, setIsZoomMode] = useState(false);
  const [hasZoomed, setHasZoomed]   = useState(false);
  const [cssScale, setCssScale]     = useState(1.0);
  const cssScaleRef      = useRef(1.0);
  const confirmedZoomRef = useRef(1.0);
  const [panOffset, setPanOffset]   = useState({ x: 0, y: 0 });
  const panOffsetRef     = useRef({ x: 0, y: 0 });

  // ── Spring-back al soltar gesto fuera de bounds ───────────────────
  const [isSpringBack, setIsSpringBack] = useState(false);
  const springTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ── Dimensiones base del flipbook (sin zoom) ──────────────────────
  const [baseDims, setBaseDims] = useState({ w: 400, h: 600 });

  // ── Refs ──────────────────────────────────────────────────────────
  const readAreaRef    = useRef<HTMLDivElement>(null);
  const isDraggingRef  = useRef(false);
  const dragStartRef   = useRef({ x: 0, y: 0 });
  const panAtDragRef   = useRef({ x: 0, y: 0 });
  const pinchDistRef   = useRef<number | null>(null);
  const pinchScaleRef  = useRef(1.0);
  const pinchPanRef    = useRef({ x: 0, y: 0 });
  const pinchMidRef    = useRef({ x: 0, y: 0 });

  // ── Calcular dimensiones base: 100vh − header ─────────────────────
  const calcBaseDims = useCallback(() => {
    if (!pdfDimensions.width || !pdfDimensions.height) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const availH = vh - HEADER_H;
    const availW = isMobile ? vw : vw / 2;
    const scale = Math.min(availH / pdfDimensions.height, availW / pdfDimensions.width);
    setBaseDims({
      w: Math.floor(pdfDimensions.width  * scale),
      h: Math.floor(pdfDimensions.height * scale),
    });
  }, [isMobile, pdfDimensions]);

  useLayoutEffect(() => {
    if (!isClient) return;
    calcBaseDims();
    window.addEventListener('resize', calcBaseDims);
    return () => window.removeEventListener('resize', calcBaseDims);
  }, [isClient, calcBaseDims]);

  const flipbookKey = `${baseDims.w}x${baseDims.h}-${isZoomMode ? 'z' : 'r'}`;

  // ── clampPan: límite — el libro NUNCA pierde el foco ────────────────
  // Máximo pan = cuando el borde del libro toca el borde de la pantalla
  // + PAN_EXTRA px de margen para ver contenido cercano al borde y evitar
  // que el pill de zoom tape el contenido.
  const PAN_EXTRA = 48; // px de margen extra permitido más allá del borde del libro
  const clampPan = useCallback((pan: { x: number; y: number }, scale: number) => {
    const scaledW = baseDims.w * scale;
    const scaledH = baseDims.h * scale;
    const vw      = window.innerWidth;
    const vh      = window.innerHeight - HEADER_H;
    const bookW   = isMobile ? scaledW : scaledW * 2;
    const bookH   = scaledH;
    const maxPanX = Math.max(0, (bookW - vw) / 2) + PAN_EXTRA;
    const maxPanY = Math.max(0, (bookH - vh) / 2) + PAN_EXTRA;
    return {
      x: Math.min(maxPanX, Math.max(-maxPanX, pan.x)),
      y: Math.min(maxPanY, Math.max(-maxPanY, pan.y)),
    };
  }, [baseDims, isMobile]);

  // Rubber-band: resistencia suave cuando se intenta ir más allá del límite
  const rubberPan = useCallback((pan: { x: number; y: number }, scale: number) => {
    const scaledW = baseDims.w * scale;
    const scaledH = baseDims.h * scale;
    const vw      = window.innerWidth;
    const vh      = window.innerHeight - HEADER_H;
    const bookW   = isMobile ? scaledW : scaledW * 2;
    const bookH   = scaledH;
    const maxPanX = Math.max(0, (bookW - vw) / 2) + PAN_EXTRA;
    const maxPanY = Math.max(0, (bookH - vh) / 2) + PAN_EXTRA;
    return {
      x: rubberBandVal(pan.x, maxPanX),
      y: rubberBandVal(pan.y, maxPanY),
    };
  }, [baseDims, isMobile]);

  // Spring-back: anima de vuelta al límite duro si el gesto terminó fuera
  const snapBackIfNeeded = useCallback(() => {
    const clamped = clampPan(panOffsetRef.current, cssScaleRef.current);
    if (
      Math.abs(clamped.x - panOffsetRef.current.x) > 0.5 ||
      Math.abs(clamped.y - panOffsetRef.current.y) > 0.5
    ) {
      if (springTimerRef.current) clearTimeout(springTimerRef.current);
      setIsSpringBack(true);
      panOffsetRef.current = clamped;
      setPanOffset(clamped);
      springTimerRef.current = setTimeout(() => setIsSpringBack(false), 420);
    }
  }, [clampPan]);

  // ── Sync refs con state ───────────────────────────────────────────
  useEffect(() => { cssScaleRef.current  = cssScale;  }, [cssScale]);
  useEffect(() => { panOffsetRef.current = panOffset; }, [panOffset]);

  // ── Reset al cambiar idioma/páginas ───────────────────────────────
  useEffect(() => {
    setCurrentBookPage(0);
    setIsZoomMode(false);
    setHasZoomed(false);
    setCssScale(1.0);
    cssScaleRef.current      = 1.0;
    confirmedZoomRef.current = 1.0;
    setPanOffset({ x: 0, y: 0 });
    panOffsetRef.current     = { x: 0, y: 0 };
  }, [pages]);

  // ── TTS ───────────────────────────────────────────────────────────
  const {
    isReading, isPaused, currentReadingPage,
    startReading, pause, resume, stop,
    setReadingRate, isSupported, isReady, currentRate,
  } = useBookReader({
    pages: pages.map(p => ({ id: p.id, extractedText: p.extractedText })),
    language, rate: 1.0,
    onPageChange: (idx) => {
      (bookRef.current as any)?.pageFlip?.()?.turnToPage(idx);
    },
    onReadingComplete: () => {},
    onError: () => {},
  });

  // ── Entrar / salir zoom ────────────────────────────────────────────
  const enterZoom = useCallback(() => {
    if (isReading) stop();
    setIsZoomMode(true);
    setHasZoomed(false);
    setCssScale(1.0);
    cssScaleRef.current      = 1.0;
    confirmedZoomRef.current = 1.0;
    setPanOffset({ x: 0, y: 0 });
    panOffsetRef.current     = { x: 0, y: 0 };
  }, [isReading, stop]);

  const exitZoom = useCallback(() => {
    setIsZoomMode(false);
    setHasZoomed(false);
    setIsSpringBack(false);
    setCssScale(1.0);
    cssScaleRef.current      = 1.0;
    confirmedZoomRef.current = 1.0;
    setPanOffset({ x: 0, y: 0 });
    panOffsetRef.current     = { x: 0, y: 0 };
  }, []);

  const toggleZoom = useCallback(() => {
    isZoomMode ? exitZoom() : enterZoom();
  }, [isZoomMode, enterZoom, exitZoom]);

  // ── applyScale: aplica zoom con pan optional ──────────────────────
  // · Si llega a 1×: resetea pan a {0,0} con spring-back (regresa al centro).
  // · Si recibe newPan: lo clampea y lo usa directamente.
  // · Si no: ajusta pan proporcional y clampea.
  const applyScale = useCallback((newScale: number, newPan?: { x: number; y: number }) => {
    const clamped = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, +newScale.toFixed(2)));
    if (clamped > 1.0) setHasZoomed(true);
    const prevScale = confirmedZoomRef.current || 1;
    confirmedZoomRef.current = clamped;
    cssScaleRef.current = clamped;
    setCssScale(clamped);

    // Al llegar a 1×: animar de vuelta al centro con spring-back
    if (clamped <= ZOOM_MIN) {
      if (
        Math.abs(panOffsetRef.current.x) > 0.5 ||
        Math.abs(panOffsetRef.current.y) > 0.5
      ) {
        if (springTimerRef.current) clearTimeout(springTimerRef.current);
        setIsSpringBack(true);
        panOffsetRef.current = { x: 0, y: 0 };
        setPanOffset({ x: 0, y: 0 });
        springTimerRef.current = setTimeout(() => setIsSpringBack(false), 420);
      } else {
        panOffsetRef.current = { x: 0, y: 0 };
        setPanOffset({ x: 0, y: 0 });
      }
      return;
    }

    if (newPan) {
      const safe = clampPan(newPan, clamped);
      panOffsetRef.current = safe;
      setPanOffset(safe);
    } else {
      const ratio = clamped / prevScale;
      setPanOffset(p => {
        const proposed = { x: p.x * ratio, y: p.y * ratio };
        const safe      = clampPan(proposed, clamped);
        panOffsetRef.current = safe;
        return safe;
      });
    }
  }, [clampPan]);

  const zoomIn  = useCallback(() => applyScale(confirmedZoomRef.current + ZOOM_STEP), [applyScale]);
  const zoomOut = useCallback(() => applyScale(confirmedZoomRef.current - ZOOM_STEP), [applyScale]);

  // ── Pan helpers (teclado) ─────────────────────────────────────────
  const pan = useCallback((dx: number, dy: number) => {
    setPanOffset(p => {
      const proposed = { x: p.x + dx, y: p.y + dy };
      const safe      = clampPan(proposed, cssScaleRef.current);
      panOffsetRef.current = safe;
      return safe;
    });
  }, [clampPan]);

  // ── Mouse drag (desktop) ──────────────────────────────────────────
  const onOverlayMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    isDraggingRef.current = true;
    dragStartRef.current  = { x: e.clientX, y: e.clientY };
    panAtDragRef.current  = { ...panOffsetRef.current };
    if (springTimerRef.current) clearTimeout(springTimerRef.current);
    setIsSpringBack(false);
    e.preventDefault();
  }, []);

  useEffect(() => {
    if (!isZoomMode) return;
    const onMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const raw = {
        x: panAtDragRef.current.x + (e.clientX - dragStartRef.current.x),
        y: panAtDragRef.current.y + (e.clientY - dragStartRef.current.y),
      };
      // Rubber-band durante el drag
      const next = rubberPan(raw, cssScaleRef.current);
      panOffsetRef.current = next;
      setPanOffset(next);
    };
    const onUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      snapBackIfNeeded();
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
    };
  }, [isZoomMode, rubberPan, snapBackIfNeeded]);

  // ── Pinch / pan táctil ────────────────────────────────────────────
  useEffect(() => {
    if (!isZoomMode) return;
    const el = readAreaRef.current;
    if (!el) return;

    const onTStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const t0 = e.touches[0], t1 = e.touches[1];
        pinchDistRef.current  = Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY);
        // Capturar baseline desde refs (siempre frescos, sin stale closure)
        pinchScaleRef.current = confirmedZoomRef.current;
        pinchPanRef.current   = { ...panOffsetRef.current };
        pinchMidRef.current   = {
          x: (t0.clientX + t1.clientX) / 2,
          y: (t0.clientY + t1.clientY) / 2,
        };
        // Cancelar spring-back si el usuario vuelve a tocar
        if (springTimerRef.current) clearTimeout(springTimerRef.current);
        setIsSpringBack(false);
      }
    };

    const onTMove = (e: TouchEvent) => {
      e.preventDefault();

      if (e.touches.length === 2 && pinchDistRef.current !== null) {
        // ── Pinch: zoom centrado en el midpoint de los dedos ──
        const t0   = e.touches[0], t1 = e.touches[1];
        const dist = Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY);
        const newScale = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN,
          pinchScaleRef.current * (dist / pinchDistRef.current),
        ));

        const midX = (t0.clientX + t1.clientX) / 2;
        const midY = (t0.clientY + t1.clientY) / 2;

        // Centro del área de lectura (debajo del header)
        const cx = window.innerWidth  / 2;
        const cy = HEADER_H + (window.innerHeight - HEADER_H) / 2;

        // Punto inicial del pinch relativo al centro del área de lectura
        const initMidRelX = pinchMidRef.current.x - cx;
        const initMidRelY = pinchMidRef.current.y - cy;
        const basePan     = pinchPanRef.current;

        // Convertir punto inicial a coordenadas del mundo (invariante al zoom)
        const worldX = (initMidRelX - basePan.x) / pinchScaleRef.current;
        const worldY = (initMidRelY - basePan.y) / pinchScaleRef.current;

        // Midpoint actual en coordenadas relativas al centro del área de lectura
        const curMidRelX = midX - cx;
        const curMidRelY = midY - cy;

        // Pan para que el punto del mundo quede en la posición actual del midpoint
        const proposed = {
          x: curMidRelX - worldX * newScale,
          y: curMidRelY - worldY * newScale,
        };
        // Rubber-band durante el pinch
        const newPan = rubberPan(proposed, newScale);

        const scaled = +newScale.toFixed(2);
        if (scaled > 1.0) setHasZoomed(true);
        cssScaleRef.current  = scaled;
        panOffsetRef.current = newPan;
        setCssScale(scaled);
        setPanOffset(newPan);
      }
      // Single-finger: manejado abajo
    };

    const onTEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        // Confirmar escala usando ref (sin stale closure)
        confirmedZoomRef.current = cssScaleRef.current;
        pinchDistRef.current     = null;

        // Si quedó en 1×, resetear pan al centro con spring-back
        if (cssScaleRef.current <= ZOOM_MIN) {
          if (
            Math.abs(panOffsetRef.current.x) > 0.5 ||
            Math.abs(panOffsetRef.current.y) > 0.5
          ) {
            if (springTimerRef.current) clearTimeout(springTimerRef.current);
            setIsSpringBack(true);
            panOffsetRef.current = { x: 0, y: 0 };
            setPanOffset({ x: 0, y: 0 });
            springTimerRef.current = setTimeout(() => setIsSpringBack(false), 420);
          }
        } else {
          // Spring-back si el pan quedó fuera del límite duro
          snapBackIfNeeded();
        }
      }
    };

    // ── Pan con 1 dedo ──
    let t1Last = { x: 0, y: 0 };
    const onT1Start = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        t1Last = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        if (springTimerRef.current) clearTimeout(springTimerRef.current);
        setIsSpringBack(false);
      }
    };
    const onT1Move = (e: TouchEvent) => {
      if (e.touches.length === 1 && pinchDistRef.current === null) {
        const dx = e.touches[0].clientX - t1Last.x;
        const dy = e.touches[0].clientY - t1Last.y;
        t1Last = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        setPanOffset(p => {
          const proposed = { x: p.x + dx, y: p.y + dy };
          const next      = rubberPan(proposed, cssScaleRef.current);
          panOffsetRef.current = next;
          return next;
        });
      }
    };
    const onT1End = (e: TouchEvent) => {
      if (e.touches.length === 0) {
        snapBackIfNeeded();
      }
    };

    el.addEventListener('touchstart', onTStart,  { passive: true });
    el.addEventListener('touchstart', onT1Start, { passive: true });
    el.addEventListener('touchmove',  onTMove,   { passive: false });
    el.addEventListener('touchmove',  onT1Move,  { passive: false });
    el.addEventListener('touchend',   onTEnd,    { passive: true });
    el.addEventListener('touchend',   onT1End,   { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTStart);
      el.removeEventListener('touchstart', onT1Start);
      el.removeEventListener('touchmove',  onTMove);
      el.removeEventListener('touchmove',  onT1Move);
      el.removeEventListener('touchend',   onTEnd);
      el.removeEventListener('touchend',   onT1End);
    };
  // Solo isZoomMode — todos los valores vivos vienen de refs
  }, [isZoomMode, rubberPan, snapBackIfNeeded]);

  // ── Wheel = zoom centrado en posición del mouse ───────────────────
  useEffect(() => {
    if (!isZoomMode) return;
    const el = readAreaRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const prevScale = confirmedZoomRef.current;
      const newScale  = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN,
        +(prevScale + (e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP)).toFixed(2),
      ));
      if (newScale === prevScale) return;

      // Centro del área de lectura (debajo del header)
      const cx        = window.innerWidth  / 2;
      const cy        = HEADER_H + (window.innerHeight - HEADER_H) / 2;
      const mouseRelX = e.clientX - cx;
      const mouseRelY = e.clientY - cy;
      const curPan    = panOffsetRef.current;

      // Punto debajo del mouse en coordenadas del mundo
      const worldX = (mouseRelX - curPan.x) / prevScale;
      const worldY = (mouseRelY - curPan.y) / prevScale;

      // Nuevo pan: ese punto del mundo debe seguir bajo el mouse
      const proposed = {
        x: mouseRelX - worldX * newScale,
        y: mouseRelY - worldY * newScale,
      };
      applyScale(newScale, proposed); // applyScale ya clampea
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [isZoomMode, applyScale]);

  // ── Teclado: captura antes que usePreviewControls ─────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isPlus = e.key === '+' || e.key === '=' ||
                     e.code === 'NumpadAdd' ||
                     (e.ctrlKey && (e.key === '+' || e.key === '='));
      const isMinus = e.key === '-' || e.code === 'NumpadSubtract' ||
                      (e.ctrlKey && e.key === '-');

      if (isPlus) {
        e.preventDefault();
        if (!isZoomMode) enterZoom();
        setTimeout(() => applyScale(confirmedZoomRef.current + ZOOM_STEP), 0);
        return;
      }
      if (isMinus) {
        e.preventDefault();
        if (isZoomMode) {
          const next = Math.max(ZOOM_MIN, confirmedZoomRef.current - ZOOM_STEP);
          applyScale(next);
          // NO salir de zoom mode: el usuario puede volver a hacer zoom
          // sin necesidad de presionar lupa de nuevo
        }
        return;
      }

      if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)) return;

      if (isZoomMode && hasZoomed) {
        e.stopImmediatePropagation();
        e.preventDefault();
        if (e.key === 'ArrowLeft')  pan( PAN_ARROW, 0);
        if (e.key === 'ArrowRight') pan(-PAN_ARROW, 0);
        if (e.key === 'ArrowUp')    pan(0,  PAN_ARROW);
        if (e.key === 'ArrowDown')  pan(0, -PAN_ARROW);
      }
    };

    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [isZoomMode, hasZoomed, enterZoom, exitZoom, applyScale, pan]);

  // ── Flip ──────────────────────────────────────────────────────────
  const onFlip = useCallback((e: any) => {
    handleFlip(e);
    if (e?.data !== undefined) { setCurrentBookPage(e.data); onPageFlip?.(e.data); }
  }, [handleFlip, onPageFlip]);

  // ── Tap lateral (móvil, modo lectura) ────────────────────────────
  const goNext = useCallback(() => {
    (bookRef.current as any)?.pageFlip?.()?.flipNext();
  }, [bookRef]);
  const goPrev = useCallback(() => {
    (bookRef.current as any)?.pageFlip?.()?.flipPrev();
  }, [bookRef]);

  // ── Páginas visibles (TTS indicator) ─────────────────────────────
  const visiblePages = useMemo(() => {
    if (isMobile) return { leftPageIndex: currentBookPage, rightPageIndex: -1 };
    return {
      leftPageIndex: currentBookPage,
      rightPageIndex: currentBookPage + 1 < pages.length ? currentBookPage + 1 : -1,
    };
  }, [currentBookPage, isMobile, pages.length]);

  const memoPages = useMemo(() =>
    pages.map((p, i) => ({ ...p, key: `p-${p.id}-${i}` })),
  [pages]);

  const renderPages = useCallback(() =>
    memoPages.map(p => (
      <div className="demoPage" key={p.key}>
        {p.image && (
          <img src={p.image} alt=""
            className="w-full h-full object-fill pointer-events-none select-none"
            draggable={false} />
        )}
      </div>
    )),
  [memoPages]);

  useEffect(() => () => {
    stop();
    if (springTimerRef.current) clearTimeout(springTimerRef.current);
  }, [stop]);

  if (!isClient) return null;

  const audioProps = enableTTS && isSupported ? {
    isReading, isPaused, isSupported, isReady, currentReadingPage, currentRate,
    onStart: startReading, onPause: pause, onResume: resume, onStop: stop,
    onRateChange: setReadingRate, currentBookPage,
  } : undefined;

  const langLabel = LANG_LABELS[language] ?? language.toUpperCase().slice(0, 2);

  // Transform del wrapper
  const wrapperTransform = isZoomMode
    ? `translate(${panOffset.x}px, ${panOffset.y}px) scale(${cssScale})`
    : 'none';

  // Transición adaptativa:
  // - spring-back: animación suave más larga (rebote)
  // - drag activo: sin transición (instantáneo)
  // - botones/teclado/wheel: micro ease
  const wrapperTransition = isSpringBack
    ? 'transform 0.38s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    : isDraggingRef.current
      ? 'none'
      : 'transform 0.08s ease-out';

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col" style={{ zIndex: 9999 }}>

      {/* ── Header ── */}
      <PreviewHeader
        title={title}
        totalPages={pages.length}
        isVisible={showControls}
        onClose={() => { stop(); onClose(); }}
        audioProps={audioProps}
      />

      {/* ── Área de lectura: 100vh − header ── */}
      <div
        ref={readAreaRef}
        className="flex-1 relative flex items-center justify-center"
        style={{ overflow: 'hidden', userSelect: 'none' }}
      >
        <ReadingPageIndicator
          isReading={isReading}
          currentReadingPage={currentReadingPage}
          leftPageIndex={visiblePages.leftPageIndex}
          rightPageIndex={visiblePages.rightPageIndex}
          isMobile={isMobile}
          totalPages={pages.length}
        />

        {/*
          Wrapper con CSS transform (scale + translate).
          El flipbook SIEMPRE tiene baseDims — sin remount al cambiar zoom.
          transformOrigin: center center → zoom escala desde el centro de pantalla.
          El pan (translate) compensa para centrar en el punto de interés.
        */}
        <div
          style={{
            position:        'relative',
            flexShrink:       0,
            transform:        wrapperTransform,
            transformOrigin:  'center center',
            transition:       wrapperTransition,
            cursor: isZoomMode
              ? (isDraggingRef.current ? 'grabbing' : 'grab')
              : 'default',
          }}
        >
          <HTMLFlipBook
            key={flipbookKey}
            ref={bookRef}
            width={baseDims.w}
            height={baseDims.h}
            size="fixed"
            minWidth={baseDims.w}
            maxWidth={baseDims.w}
            minHeight={baseDims.h}
            maxHeight={baseDims.h}
            drawShadow={true}
            maxShadowOpacity={0.5}
            showCover={true}
            flippingTime={900}
            usePortrait={isMobile}
            startZIndex={0}
            autoSize={false}
            startPage={currentBookPage}
            clickEventForward={!isZoomMode}
            useMouseEvents={!isZoomMode}
            swipeDistance={isZoomMode ? 999999 : 30}
            showPageCorners={!isZoomMode}
            disableFlipByClick={isZoomMode}
            onFlip={onFlip}
            className="demo-book"
            style={{}}
            mobileScrollSupport={false}
          >
            {renderPages()}
          </HTMLFlipBook>

          {/* OVERLAY bloqueador en zoom mode - FIXED para cubrir toda la ventana */}
          {isZoomMode && (
            <div
              style={{
                position:      'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width:         '100vw',
                height:        '100vh',
                zIndex:        9999,
                pointerEvents: 'all',
                touchAction:   'none',
                cursor:        isDraggingRef.current ? 'grabbing' : 'grab',
                background:    'transparent',
                outline:       '2px solid rgba(251,191,36,0.3)',
                outlineOffset: '-2px',
              }}
              onMouseDown={onOverlayMouseDown}
              onClick={(e) => {
                // Click sin drag → zoom in centrado en el punto del click
                const dx = Math.abs(e.clientX - dragStartRef.current.x);
                const dy = Math.abs(e.clientY - dragStartRef.current.y);
                if (dx < 5 && dy < 5) {
                  const prevScale = confirmedZoomRef.current;
                  const newScale  = Math.min(ZOOM_MAX, +(prevScale + ZOOM_STEP).toFixed(2));
                  if (newScale === prevScale) return;

                  // Centro del área de lectura (debajo del header)
                  const cx       = window.innerWidth  / 2;
                  const cy       = HEADER_H + (window.innerHeight - HEADER_H) / 2;
                  const relX     = e.clientX - cx;
                  const relY     = e.clientY - cy;
                  const curPan   = panOffsetRef.current;

                  // Punto del click en coordenadas del mundo
                  const worldX = (relX - curPan.x) / prevScale;
                  const worldY = (relY - curPan.y) / prevScale;

                  // Nuevo pan: el punto del mundo sigue bajo el click
                  const proposed = {
                    x: relX - worldX * newScale,
                    y: relY - worldY * newScale,
                  };
                  applyScale(newScale, proposed);
                }
              }}
            />
          )}
        </div>

        {/* Zonas tap lateral (modo lectura) */}
        {!isZoomMode && (
          <>
            <button onClick={goPrev} aria-label="Página anterior"
              style={{
                position: 'absolute', top: 0, left: 0,
                width: isMobile ? '22%' : '7%', height: '100%',
                zIndex: 100, background: 'transparent', border: 'none',
                cursor: currentBookPage > 0 ? 'pointer' : 'default', opacity: 0,
              }} />
            <button onClick={goNext} aria-label="Página siguiente"
              style={{
                position: 'absolute', top: 0, right: 0,
                width: isMobile ? '22%' : '7%', height: '100%',
                zIndex: 100, background: 'transparent', border: 'none',
                cursor: currentBookPage < pages.length - 1 ? 'pointer' : 'default', opacity: 0,
              }} />
          </>
        )}
      </div>

      {/* ── Floating pill: [−][+][🔍] | [ES] ── */}
      <div
        style={{
          position:    'fixed',
          bottom:       20,
          right:        20,
          zIndex:       10000,
          display:     'flex',
          alignItems:  'center',
          gap:          5,
          padding:     '5px 8px',
          borderRadius: 999,
          background:   'rgba(2,6,23,0.88)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          border:       '1px solid rgba(255,255,255,0.1)',
          boxShadow:    '0 4px 24px rgba(0,0,0,0.55)',
          transition:   'opacity 0.25s',
          opacity:      (showControls || isMobile) ? 1 : 0,
          pointerEvents: (showControls || isMobile) ? 'auto' : 'none',
        }}
      >
        {isZoomMode && (
          <>
            <button onClick={zoomOut} disabled={cssScale <= ZOOM_MIN}
              title="Reducir zoom (−)"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 28, height: 28, borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.13)',
                color: cssScale <= ZOOM_MIN ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.7)',
                cursor: cssScale <= ZOOM_MIN ? 'not-allowed' : 'pointer',
              }}>
              <ZoomOut size={12} strokeWidth={2} />
            </button>

            <button onClick={zoomIn} disabled={cssScale >= ZOOM_MAX}
              title="Aumentar zoom (+)"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 28, height: 28, borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.13)',
                color: cssScale >= ZOOM_MAX ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.7)',
                cursor: cssScale >= ZOOM_MAX ? 'not-allowed' : 'pointer',
              }}>
              <ZoomIn size={12} strokeWidth={2} />
            </button>

            <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.13)' }} />
          </>
        )}

        <button onClick={toggleZoom} title={isZoomMode ? 'Volver a lectura (−)' : 'Zoom (+)'}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 30, height: 30, borderRadius: '50%',
            background: isZoomMode ? '#fbbf24' : 'rgba(255,255,255,0.08)',
            border: isZoomMode ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.13)',
            color: isZoomMode ? '#1e293b' : 'rgba(255,255,255,0.6)',
            cursor: 'pointer',
            boxShadow: isZoomMode ? '0 0 14px rgba(251,191,36,0.55)' : 'none',
            transition: 'all 0.2s',
          }}>
          <Search size={14} strokeWidth={2.5} />
        </button>

        <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.13)' }} />

        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
          color: 'rgba(255,255,255,0.42)', userSelect: 'none', paddingInline: 4,
        }}>
          {langLabel}
        </span>
      </div>
    </div>
  );
}
