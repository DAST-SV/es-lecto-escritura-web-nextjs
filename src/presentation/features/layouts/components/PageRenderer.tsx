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
  // ✅ Usar getLayout en vez de acceder directamente al registry
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

  const content = (
    <div
      className="flipbook-page"
      style={{
        background: getBackground,
        borderRadius: getBorderRadius,
        width: "100%",
        height: "100%",
      }}
    >
      <div className="flipbook-page-content">
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
      >
        {content}
      </motion.div>
    );
  }

  return (
    <div className="w-full h-full rich-content flex box-border">
      {content}
    </div>
  );
}