import React from "react";
import type { Page } from "@/src/typings/types-page-book/index";

interface Props {
  page: Page;
}

// ============================================
// 2. TextLeftImageRightLayout.tsx
// ============================================
export function TextLeftImageRightLayout({ page }: Props) {
  return (
    <div className="w-full h-full flex gap-6 p-6">
      {/* ✅ Texto a la izquierda - FLEX */}
      <div className="flex-1 flex flex-col justify-center overflow-auto">
        {page.title && (
          <div dangerouslySetInnerHTML={{ __html: page.title }} className="mb-3" />
        )}
        
        {page.text && (
          <div dangerouslySetInnerHTML={{ __html: page.text }} />
        )}
      </div>

      {/* ✅ Imagen a la derecha - ALTURA FIJA */}
      {page.image && (
        <div className="w-1/2 flex items-center justify-center">
          <img
            src={page.image}
            alt={page.title || ""}
            className="w-full h-full object-contain rounded-lg"
            style={{ maxHeight: '100%' }}
          />
        </div>
      )}
    </div>
  );
}