import React from "react";
import type { Page } from "@/src/typings/types-page-book/index";

interface Props {
  page: Page;
}

export function CoverLayout({ page }: Props) {
  return (
    <div className="w-full h-full relative flex items-center justify-center">
      {/* Imagen de fondo */}
      {page.image && (
        <img
          src={page.image}
          alt={page.title || "Portada"}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Overlay semi-transparente */}
      <div className="absolute inset-0 bg-gradient-to-b bg-white" />

      {/* Contenido centrado */}
      <div className="relative z-10 text-center px-6 py-8 max-w-2xl">
        {page.title && (
          <div 
            dangerouslySetInnerHTML={{ __html: page.title }} 
            className="text-white drop-shadow-lg"
          />
        )}

        {page.text && (
          <div 
            dangerouslySetInnerHTML={{ __html: page.text }}
            className="text-white/90 mt-4 drop-shadow-md"
          />
        )}
      </div>
    </div>
  );
}