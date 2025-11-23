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

  const getBackground =
    page.background && page.background in backgrounds
      ? backgrounds[page.background as keyof typeof backgrounds]
      : typeof page.background === "string"
        ? /^(https?:\/\/|localhost|blob:)/.test(page.background)
          ? `url(${page.background}) center/cover no-repeat`
          : backgrounds.blanco
        : backgrounds.blanco;

  const animation = page.animation ? getAnimation(page.animation) : null;

  // Determinar si tiene fondo personalizado (no blanco)
  const hasCustomBackground = page.background && page.background !== 'blanco';

  const content = (
    <div
      className="flipbook-page"
      style={{
        background: getBackground,
        borderRadius: getBorderRadius,
        width: "100%",
        height: "100%",
        padding: 0,
        margin: 0,
        position: 'relative',
        overflow: 'hidden',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Wrapper: SIN padding cuando hay fondo, CON padding cuando no hay fondo */}
      <div 
        className={`flipbook-page-content ${hasCustomBackground ? '' : 'with-padding'}`}
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