// src/components/PageRenderer.tsx
import React from "react";
import type { Page } from "@/src/typings/types-page-book/index";
import { layouts } from "../layouts";
import { backgrounds } from "@/src/typings/types-page-book/backgrounds";
import { HtmlFontFamilies } from "@/src/typings/types-page-book/HtmlFontFamilies";
import { borders } from "@/src/typings/types-page-book/borders";
import { textColors } from "@/src/typings/types-page-book/textColors ";
import { motion } from "framer-motion";
import { getAnimation } from "@/src/utils/animations/animations";

interface Props {
  page: Page;
  isActive?: boolean;
}

export const PageRenderer: React.FC<Props> = ({ page, isActive }) => {
  const layoutMap: Record<string, React.FC<{ page: Page; textColor?: string }>> = layouts;
  const Layout = layoutMap[String(page.layout)] || layoutMap.FullPageLayout;

  const getBorderRadius = page.border ? borders[page.border] : borders.cuadrado;
  const getFont = page.font ? HtmlFontFamilies[page.font] : HtmlFontFamilies.Arial;

  const getBackground =
    page.background && page.background in backgrounds
      ? backgrounds[page.background as keyof typeof backgrounds]
      : typeof page.background === "string"
        ? `url(${page.background}) center/cover no-repeat`
        : backgrounds.blanco;

  // Cambiar esta línea para obtener el color correctamente:
  const pageTextColor = page.textColor && page.textColor in textColors
    ? textColors[page.textColor as keyof typeof textColors]
    : textColors.negro;
  const animation = page.animation ? getAnimation(page.animation) : null;

  const content = (
    <div
      style={{
        background: getBackground,
        fontFamily: getFont,
        borderRadius: getBorderRadius,
        color: pageTextColor, // ← Agregar esta línea
        overflow: "hidden",
        width: "100%",
        height: "100%",
        whiteSpace : "pre-wrap"
      }}
    >
      <Layout page={page} />
    </div>
  );

  if (animation) {
    return (
      <motion.div
        className="w-full h-full flex items-center justify-center box-border"
        initial="hidden"
        animate={isActive ? "visible" : "hidden"}
        variants={animation}
      >
        {content}
      </motion.div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center box-border">
      {content}
    </div>
  );
};

export default PageRenderer;
