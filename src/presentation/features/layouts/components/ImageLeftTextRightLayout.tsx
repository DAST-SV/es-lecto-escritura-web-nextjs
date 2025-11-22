import React from "react";
import type { Page } from "@/src/typings/types-page-book/index";

interface Props {
  page: Page;
}

export function ImageLeftTextRightLayout({ page }: Props) {
  return (
    <div className="w-full h-full flex gap-6 p-6">
      {/* Imagen a la izquierda */}
      {page.image && (
        <div className="flex-1 flex items-center justify-center">
          <img
            src={page.image}
            alt={page.title || ""}
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      )}

      {/* Texto a la derecha */}
      <div className="flex-1 flex flex-col justify-center">
        {page.title && (
          <div dangerouslySetInnerHTML={{ __html: page.title }} className="mb-3" />
        )}
        
        {page.text && (
          <div dangerouslySetInnerHTML={{ __html: page.text }} />
        )}
      </div>
    </div>
  );
}