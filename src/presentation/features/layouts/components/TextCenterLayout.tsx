import React from "react";
import type { Page } from "@/src/typings/types-page-book/index";

interface Props {
  page: Page;
}

/**
 * ✅ CORREGIDO: Texto empieza arriba-izquierda (como libro real)
 * NO centrado por defecto
 */
export function TextCenterLayout({ page }: Props) {
  return (
    <div className="w-full h-full flex flex-col">
      {page.title && (
        <div 
          dangerouslySetInnerHTML={{ __html: page.title }}
          className="w-full"
        />
      )}
      
      {page.text && (
        <div 
          dangerouslySetInnerHTML={{ __html: page.text }}
          className="w-full flex-1"
        />
      )}
    </div>
  );
}