/**
 * UBICACIÓN: src/presentation/features/layouts/components/PageRenderer.tsx
 * 
 * ✅ MEJORADO: Estilos consistentes entre editor y lector
 */

import React from "react";
import type { Page } from "@/src/typings/types-page-book/index";
import { getLayout } from "../registry";
import { backgrounds } from "@/src/typings/types-page-book/backgrounds";
import { borders } from "@/src/typings/types-page-book/borders";
import { motion } from "framer-motion";
import { getAnimation } from "@/src/utils/animations/animations";

// ✅ Importar estilos compartidos
import '@/src/presentation/features/layouts/styles/book-shared.css';
import '@/src/style/rich-content.css';

interface Props {
  page: Page;
  isActive?: boolean;
}

export function PageRenderer({ page, isActive }: Props) {
  const Layout = getLayout(page.layout);
  const getBorderRadius = page.border ? borders[page.border] : borders.cuadrado;

  /**
   * ✅ Lógica de fondo unificada:
   * 1. Color de fondo (backgroundColor)
   * 2. Imagen de fondo encima (backgroundImage con contain)
   */
  const getBackgroundStyle = (): React.CSSProperties => {
    const bg = page.background;

    // Sin fondo → blanco
    if (!bg || bg === '' || bg === 'blanco') {
      return { backgroundColor: backgrounds.blanco || '#ffffff' };
    }

    // Es una URL de imagen
    if (typeof bg === 'string' && /^(https?:\/\/|blob:)/.test(bg)) {
      return {
        backgroundColor: '#ffffff',
        backgroundImage: `url(${bg})`,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'contain',
      };
    }

    // Es un color hex
    if (typeof bg === 'string' && bg.startsWith('#')) {
      return { backgroundColor: bg };
    }

    // Es un preset de backgrounds
    if (bg in backgrounds) {
      return { backgroundColor: backgrounds[bg as keyof typeof backgrounds] };
    }

    // Fallback
    return { backgroundColor: '#ffffff' };
  };

  const backgroundStyle = getBackgroundStyle();
  const animation = page.animation ? getAnimation(page.animation) : null;

  // Determinar si tiene fondo personalizado (para padding)
  const hasCustomBackground = 
    page.background && 
    page.background !== 'blanco' && 
    page.background !== '' &&
    page.background !== '#ffffff';

  const content = (
    <div
      className="flipbook-page"
      style={{
        ...backgroundStyle,
        borderRadius: getBorderRadius,
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
          // ✅ Padding consistente
          padding: hasCustomBackground ? 0 : '1.5rem',
          boxSizing: 'border-box',
        }}
      >
        <Layout page={page} />
      </div>
    </div>
  );

  if (animation) {
    return (
      <motion.div
        className="w-full h-full rich-content"
        initial="hidden"
        animate={isActive ? "visible" : "hidden"}
        variants={animation}
        style={{ 
          margin: 0, 
          padding: 0, 
          overflow: 'hidden',
          width: '100%',
          height: '100%',
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
        width: '100%',
        height: '100%',
      }}
    >
      {content}
    </div>
  );
}