import React from "react";
import type { Page } from "@/src/typings/types-page-book/index";

interface Props {
  page: Page;
}

/**
 * ✅ CORREGIDO: CoverLayout usa background-color + background-image IGUAL que las demás páginas
 * El PageRenderer ya maneja esto, así que aquí solo renderizamos el contenido
 */
export function CoverLayout({ page }: Props) {
  // ✅ Ya NO necesitamos detectar ni aplicar fondos aquí
  // PageRenderer lo hace por nosotros con background-color + background-image

  return (
    <div className="w-full h-full relative flex items-center justify-center">
      {/* Contenido centrado */}
      <div className="relative z-10 text-center px-6 py-8 max-w-2xl">
        {page.title && (
          <div 
            dangerouslySetInnerHTML={{ __html: page.title }} 
            className="text-shadow-lg"
          />
        )}

        {page.text && (
          <div 
            dangerouslySetInnerHTML={{ __html: page.text }}
            className="mt-4 text-shadow-md"
          />
        )}
      </div>
    </div>
  );
}