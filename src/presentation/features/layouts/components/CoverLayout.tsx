import React from "react";
import type { Page } from "@/src/typings/types-page-book/index";

interface Props {
  page: Page;
}

export function CoverLayout({ page }: Props) {
  /**
   * ✅ Detectar imagen de fondo correctamente
   * - page.background puede ser URL (imagen) o color hex
   * - page.image NO debe usarse aquí (es independiente)
   */
  const hasBackgroundImage = 
    page.background && 
    typeof page.background === 'string' && 
    /^(https?:\/\/|blob:)/.test(page.background);

  const hasBackgroundColor = 
    page.background && 
    typeof page.background === 'string' && 
    page.background.startsWith('#');

  return (
    <div className="w-full h-full relative flex items-center justify-center">
      {/* ✅ Imagen de fondo (viene de page.background) */}
      {hasBackgroundImage && (
        <img
          src={page.background as string}
          alt={page.title || "Portada"}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* ✅ Color de fondo */}
      {hasBackgroundColor && (
        <div 
          className="absolute inset-0"
          style={{ backgroundColor: page.background as string }}
        />
      )}

      {/* Overlay semi-transparente (solo si hay imagen o color) */}
      {(hasBackgroundImage || hasBackgroundColor) && (
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/30" />
      )}

      {/* Contenido centrado */}
      <div className="relative z-10 text-center px-6 py-8 max-w-2xl">
        {page.title && (
          <div 
            dangerouslySetInnerHTML={{ __html: page.title }} 
            className={`${hasBackgroundImage || hasBackgroundColor ? 'text-white drop-shadow-lg' : 'text-gray-900'}`}
          />
        )}

        {page.text && (
          <div 
            dangerouslySetInnerHTML={{ __html: page.text }}
            className={`mt-4 ${hasBackgroundImage || hasBackgroundColor ? 'text-white/90 drop-shadow-md' : 'text-gray-700'}`}
          />
        )}
      </div>

      {/* ✅ NOTA: page.image NO se usa en CoverLayout
          La imagen de fondo viene de page.background */}
    </div>
  );
}