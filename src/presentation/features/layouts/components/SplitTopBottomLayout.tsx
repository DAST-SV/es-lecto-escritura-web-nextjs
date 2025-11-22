import React from "react";
import type { Page } from "@/src/typings/types-page-book/index";

interface Props {
  page: Page;
}

export function SplitTopBottomLayout({ page }: Props) {
  return (
    <div className="w-full h-full flex flex-col p-6">
      {/* Imagen arriba */}
      {page.image && (
        <div className="flex-1 flex items-center justify-center mb-4">
          <img
            src={page.image}
            alt={page.title || ""}
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      )}

      {/* Texto abajo */}
      <div className="flex-shrink-0">
        {page.title && (
          <div dangerouslySetInnerHTML={{ __html: page.title }} className="mb-2" />
        )}
        
        {page.text && (
          <div dangerouslySetInnerHTML={{ __html: page.text }} />
        )}
      </div>
    </div>
  );
}