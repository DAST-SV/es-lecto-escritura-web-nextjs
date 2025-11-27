/**
 * UBICACIÓN: src/presentation/features/layouts/components/PageRenderer.tsx
 * ✅ CORREGIDO: Mejor manejo de fondos (color + imagen)
 */

import React from "react";
import { getLayout } from "../registry";
import { motion } from "framer-motion";
import { getAnimation } from "@/src/utils/animations/animations";
import { Page, BACKGROUND_PRESETS, isBackgroundPreset } from "@/src/core/domain/types";
import '@/src/presentation/features/layouts/styles/book-shared.css';
import '@/src/style/rich-content.css';

interface Props {
  page: Page;
  isActive?: boolean;
}

export function PageRenderer({ page, isActive = true }: Props) {
  const Layout = getLayout(page.layout);
  
  /**
   * ✅ Lógica de fondo mejorada:
   * 1. Si es URL de imagen -> fondo con imagen
   * 2. Si es color hex -> fondo de color
   * 3. Si es preset -> convertir a color
   * 4. Default -> blanco
   */
  const getBackgroundStyle = (): React.CSSProperties => {
    const bg = page.background;

    // Sin fondo o blanco
    if (!bg || bg === '' || bg === 'blanco' || bg === '#ffffff') {
      return { backgroundColor: '#ffffff' };
    }

    // URL de imagen (https, http)
    if (typeof bg === 'string' && (bg.startsWith('https://') || bg.startsWith('http://'))) {
      return {
        backgroundColor: '#000000', // Fondo negro detrás de la imagen
        backgroundImage: `url(${bg})`,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'contain',
      };
    }

    // URL blob temporal (no debería llegar aquí en producción)
    if (typeof bg === 'string' && bg.startsWith('blob:')) {
      return {
        backgroundColor: '#000000',
        backgroundImage: `url(${bg})`,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'contain',
      };
    }

    // Color hex
    if (typeof bg === 'string' && bg.startsWith('#')) {
      return { backgroundColor: bg };
    }

    // Preset de color
    if (typeof bg === 'string' && isBackgroundPreset(bg)) {
      return { backgroundColor: BACKGROUND_PRESETS[bg] };
    }

    // Fallback
    return { backgroundColor: '#ffffff' };
  };

  const backgroundStyle = getBackgroundStyle();
  const animationVariants = page.animation ? getAnimation(page.animation) : null;
  
  // Determinar si tiene fondo personalizado (para padding)
  const hasCustomBackground = 
    page.background && 
    page.background !== 'blanco' && 
    page.background !== '' &&
    page.background !== '#ffffff';

  // Determinar si el fondo es oscuro (para texto claro)
  const isDarkBackground = 
    page.background === '#000000' ||
    page.background === 'negro' ||
    page.background === 'azulOscuro' ||
    page.background === 'verdeOscuro' ||
    (typeof page.background === 'string' && page.background.startsWith('http'));

  const content = (
    <div
      className="flipbook-page"
      style={{
        ...backgroundStyle,
        width: "100%",
        height: "100%",
        position: 'relative',
        overflow: 'hidden',
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
        style={{ margin: 0, padding: 0, overflow: 'hidden' }}
      >
        {content}
      </motion.div>
    );
  }

  return (
    <div 
      className="w-full h-full rich-content"
      style={{ margin: 0, padding: 0, overflow: 'hidden' }}
    >
      {content}
    </div>
  );
}
