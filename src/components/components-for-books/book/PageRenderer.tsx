// src/components/PageRenderer.tsx
import React from "react";
import type { Page } from "@/src/typings/types-page-book/index";
import { layouts } from "../layouts";
import { backgrounds } from "@/src/typings/types-page-book/backgrounds";
import { HtmlFontFamilies } from "@/src/typings/types-page-book/HtmlFontFamilies";
import { borders } from "@/src/typings/types-page-book/borders";
import { motion } from "framer-motion";
import { getAnimation } from "@/src/utils/animations/animations";

interface Props {
  page: Page;
  isActive?: boolean;
}

export const PageRenderer: React.FC<Props> = ({ page, isActive }) => {
  // Creamos un layoutMap dinámico 

  const layoutMap: Record<string, React.FC<{ page: Page }>> = layouts;
  const Layout = layoutMap[String(page.layout)] || layoutMap.FullPageLayout;
  const getBorderRadius = page.border ? borders[page.border] : borders.cuadrado;
  const getFont = page.font ? HtmlFontFamilies[page.font] : HtmlFontFamilies.Arial;
// Determina el valor final del background de la página

// Determina el background a usar
const getBackground =
  page.background && page.background in backgrounds
    ? backgrounds[page.background as keyof typeof backgrounds] // color predefinido
    : typeof page.background === "string"
    ? `url(${page.background}) center/cover no-repeat` // si es URL, se convierte en background
    : backgrounds.blanco; // default




  const animation = page.animation ? getAnimation(page.animation) : null;

  const content = (
    <div
      style={{
        background: getBackground,
        fontFamily: getFont,
        borderRadius: getBorderRadius,
        overflow: "hidden",
        width: "100%",
        height: "100%",
      }}
    >
      <Layout page={page} />
    </div>
  );

  // ✅ Solo aplicamos motion si hay animación definida
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

  // ✅ Si no hay animación, devolvemos un div normal
  return (
    <div className="w-full h-full flex items-center justify-center box-border">
      {content}
    </div>
  );
};

 export default  PageRenderer;