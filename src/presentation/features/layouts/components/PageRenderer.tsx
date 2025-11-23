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
   * ✅ Mejorar detección de fondo
   */
  const getBackgroundStyle = (): React.CSSProperties => {
    if (!page.background) {
      return { background: backgrounds.blanco };
    }

    const bg = page.background;

    // Si es URL (imagen de fondo)
    if (typeof bg === 'string' && /^(https?:\/\/|blob:)/.test(bg)) {
      return {
        backgroundImage: `url(${bg})`,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'auto 100%', // ✅ AJUSTAR AL ALTO
      };
    }

    // Si es color hex
    if (typeof bg === 'string' && bg.startsWith('#')) {
      return { background: bg };
    }

    // Si está en los presets
    if (bg in backgrounds) {
      return { background: backgrounds[bg as keyof typeof backgrounds] };
    }

    return { background: backgrounds.blanco };
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