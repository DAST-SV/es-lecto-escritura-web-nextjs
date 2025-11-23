import React from "react";
import type { Page } from "@/src/typings/types-page-book/index";
import { getLayout } from "../registry";
import { backgrounds } from "@/src/typings/types-page-book/backgrounds";
import { borders } from "@/src/typings/types-page-book/borders";
import { motion } from "framer-motion";
import { getAnimation } from "@/src/utils/animations/animations";
import '@/src/style/rich-content.css';

interface Props {
  page: Page;
  isActive?: boolean;
}

export function PageRenderer({ page, isActive }: Props) {
  const Layout = getLayout(page.layout);

  const getBorderRadius = page.border ? borders[page.border] : borders.cuadrado;

  /**
   * ✅ SOLUCIÓN COMPLETA: Color de fondo + imagen de fondo
   * 
   * FLUJO:
   * 1. Si hay imagen Y color: backgroundColor + backgroundImage
   * 2. Si solo hay imagen: backgroundColor blanco + backgroundImage
   * 3. Si solo hay color: backgroundColor
   * 4. Si no hay nada: backgroundColor blanco
   * 
   * RESULTADO: La imagen se muestra con 'contain' (sin recortar)
   * y el color rellena los espacios vacíos
   */
  const getBackgroundStyle = (): React.CSSProperties => {
    const bg = page.background;

    // ✅ CASO 1: No hay background → blanco
    if (!bg || bg === '' || bg === 'blanco') {
      return { backgroundColor: backgrounds.blanco };
    }

    // ✅ CASO 2: Hay imagen (URL o blob)
    if (typeof bg === 'string' && /^(https?:\/\/|blob:)/.test(bg)) {
      // La imagen irá encima del color blanco (o del color que se haya seleccionado antes)
      return {
        backgroundColor: '#ffffff', // Color base por defecto
        backgroundImage: `url(${bg})`,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'contain', // ✅ La imagen NO se recorta, se ajusta completa
      };
    }

    // ✅ CASO 3: Es un color hex
    if (typeof bg === 'string' && bg.startsWith('#')) {
      return { backgroundColor: bg };
    }

    // ✅ CASO 4: Es un preset de backgrounds
    if (bg in backgrounds) {
      return { backgroundColor: backgrounds[bg as keyof typeof backgrounds] };
    }

    // ✅ CASO 5: Fallback
    return { backgroundColor: backgrounds.blanco };
  };

  const backgroundStyle = getBackgroundStyle();
  const animation = page.animation ? getAnimation(page.animation) : null;

  const hasCustomBackground = 
    page.background && 
    page.background !== 'blanco' && 
    page.background !== '';

  const content = (
    <div
      className="flipbook-page"
      style={{
        ...backgroundStyle,
        borderRadius: getBorderRadius,
        width: "100%",
        height: "100%",
        padding: 0,
        margin: 0,
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
        }}
      >
        <Layout page={page} />
      </div>
    </div>
  );

  if (animation) {
    return (
      <motion.div
        className="w-full h-full rich-content flex box-border"
        initial="hidden"
        animate={isActive ? "visible" : "hidden"}
        variants={animation}
        style={{ margin: 0, padding: 0, overflow: 'hidden' }}
      >
        {content}
      </motion.div>
    );
  }

  return (
    <div className="w-full h-full rich-content flex box-border" style={{ margin: 0, padding: 0, overflow: 'hidden' }}>
      {content}
    </div>
  );
}