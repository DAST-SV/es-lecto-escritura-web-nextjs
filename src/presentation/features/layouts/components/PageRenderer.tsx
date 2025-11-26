/**
 * UBICACIÓN: src/presentation/features/layouts/components/PageRenderer.tsx
 * ✅ CORREGIDO: Tipos y estilos consistentes
 */

import React from "react";
import { getLayout } from "../registry";
import { motion } from "framer-motion";
import { getAnimation } from "@/src/utils/animations/animations";
import '@/src/presentation/features/layouts/styles/book-shared.css';
import '@/src/style/rich-content.css';
import { backgrounds, borders, Page as PageType } from "@/src/core/domain/types";

interface Props {
  layout: string;
  title: string;
  text: string;
  image?: string;
  background?: string;
  animation?: string;
  border?: string;
  pageNumber: number;
  isEditor: boolean;
  isActive?: boolean;
}

export function PageRenderer({ 
  layout,
  title,
  text,
  image,
  background,
  animation,
  border,
  pageNumber,
  isEditor,
  isActive 
}: Props) {
  // ✅ Convertir props a Page
  const page: PageType = {
    layout: layout as any,
    title,
    text,
    image,
    background: background as any,
    animation,
    border,
  };

  const Layout = getLayout(page.layout);
  
  // ✅ Arreglar getBorderRadius
  const getBorderRadius = () => {
    if (!page.border) return '0';
    const borderKey = page.border as keyof typeof borders;
    return borders[borderKey] || '0';
  };

  /**
   * ✅ Lógica de fondo unificada
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
    if (bg in backgrounds) {
      return { backgroundColor: backgrounds[bg as keyof typeof backgrounds] };
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
        borderRadius: getBorderRadius(),
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