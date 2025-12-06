/**
 * UBICACIÓN: src/presentation/features/layouts/components/PageRenderer.tsx
 * ✅ CORREGIDO: Mejor manejo de fondos y transiciones de imagen
 */

import React, { useMemo } from "react";
import { getLayout } from "../registry";
import { motion } from "framer-motion";
import { getAnimation } from "@/src/utils/animations/animations";
import { Page, BACKGROUND_PRESETS, isBackgroundPreset } from "@/src/core/domain/types";

interface Props {
  page: Page;
  isActive?: boolean;
}

export function PageRenderer({ page, isActive = true }: Props) {
  const Layout = getLayout(page.layout);
  
  /**
   * ✅ Memoizar estilos de fondo
   */
  const backgroundStyle = useMemo((): React.CSSProperties => {
    const bg = page.background;

    if (!bg || bg === '' || bg === 'blanco' || bg === '#ffffff') {
      return { backgroundColor: '#ffffff' };
    }

    if (typeof bg === 'string' && (bg.startsWith('https://') || bg.startsWith('http://'))) {
      return {
        backgroundColor: '#000000',
        backgroundImage: `url(${bg})`,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'contain',
      };
    }

    if (typeof bg === 'string' && bg.startsWith('blob:')) {
      return {
        backgroundColor: '#000000',
        backgroundImage: `url(${bg})`,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'contain',
      };
    }

    if (typeof bg === 'string' && bg.startsWith('#')) {
      return { backgroundColor: bg };
    }

    if (typeof bg === 'string' && isBackgroundPreset(bg)) {
      return { backgroundColor: BACKGROUND_PRESETS[bg] };
    }

    return { backgroundColor: '#ffffff' };
  }, [page.background]);

  const animationVariants = page.animation ? getAnimation(page.animation) : null;
  
  const hasCustomBackground = useMemo(() => {
    return page.background && 
      page.background !== 'blanco' && 
      page.background !== '' &&
      page.background !== '#ffffff';
  }, [page.background]);

  const isDarkBackground = useMemo(() => {
    const bg = page.background;
    if (!bg) return false;
    
    return bg === '#000000' ||
      bg === 'negro' ||
      bg === 'azulOscuro' ||
      bg === 'verdeOscuro' ||
      (typeof bg === 'string' && (bg.startsWith('http') || bg.startsWith('blob:')));
  }, [page.background]);

  const content = (
    <div
      className="flipbook-page"
      style={{
        ...backgroundStyle,
        width: "100%",
        height: "100%",
        position: 'relative',
        overflow: 'hidden',
        willChange: 'transform',
        backfaceVisibility: 'hidden',
      }}
    >
      <div 
        className={`flipbook-page-content${!hasCustomBackground ? ' with-padding' : ''}`}
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          padding: hasCustomBackground ? 0 : '1.5rem',
          boxSizing: 'border-box',
          color: isDarkBackground ? '#ffffff' : 'inherit',
          transform: 'translateZ(0)',
        }}
      >
        <Layout page={page} />
      </div>
    </div>
  );

  if (animationVariants) {
    return (
      <motion.div
        className="w-full h-full rich-content"
        initial="hidden"
        animate={isActive ? "visible" : "hidden"}
        variants={animationVariants}
        style={{ 
          margin: 0, 
          padding: 0, 
          overflow: 'hidden',
          willChange: 'transform, opacity',
        }}
      >
        {content}
      </motion.div>
    );
  }

  return (
    <div 
      className="w-full h-full rich-content"
      style={{ 
        margin: 0, 
        padding: 0, 
        overflow: 'hidden',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
      }}
    >
      {content}
    </div>
  );
}