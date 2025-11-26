/**
 * UBICACIÓN: src/presentation/features/layouts/components/PageRenderer.tsx
 * ✅ LIMPIO: Un solo tipo Page, sin conversiones
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
   * ✅ Lógica de fondo simplificada
   */
  const getBackgroundStyle = (): React.CSSProperties => {
    const bg = page.background;

    if (!bg || bg === '' || bg === 'blanco') {
      return { backgroundColor: '#ffffff' };
    }

    // URL de imagen
    if (typeof bg === 'string' && /^(https?:\/\/|blob:)/.test(bg)) {
      return {
        backgroundColor: '#ffffff',
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

    // Preset
    if (isBackgroundPreset(bg)) {
      return { backgroundColor: BACKGROUND_PRESETS[bg] };
    }

    return { backgroundColor: '#ffffff' };
  };

  const backgroundStyle = getBackgroundStyle();
  const animationVariants = page.animation ? getAnimation(page.animation) : null;
  
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