import React from "react";
import { Page } from "@/src/core/domain/types";

interface Props {
  page: Page;
}

/**
 * ✅ CoverLayout - Layout de portada
 * El fondo (color o imagen) se maneja en PageRenderer
 * Aquí solo renderizamos el contenido centrado
 */
export function CoverLayout({ page }: Props) {
  return (
    <div className="w-full h-full relative flex items-center justify-center p-6">
      {/* Contenido centrado con sombra para legibilidad */}
      <div className="relative z-10 text-center max-w-[90%]">
        {page.title && (
          <div 
            dangerouslySetInnerHTML={{ __html: page.title }} 
            className="text-shadow-lg mb-4"
            style={{
              textShadow: '0 2px 8px rgba(0,0,0,0.5)',
            }}
          />
        )}

        {page.text && (
          <div 
            dangerouslySetInnerHTML={{ __html: page.text }}
            className="text-shadow-md"
            style={{
              textShadow: '0 1px 4px rgba(0,0,0,0.4)',
            }}
          />
        )}
      </div>
    </div>
  );
}
