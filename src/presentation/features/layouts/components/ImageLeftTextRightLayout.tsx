// ============================================
// 1. ImageLeftTextRightLayout.tsx
// ============================================
import React from "react";
import { Page } from "@/src/core/domain/types";

interface Props {
  page: Page;
}

export function ImageLeftTextRightLayout({ page }: Props) {
  return (
    <div className="w-full h-full flex gap-6 p-6">
      {/* ✅ Imagen a la izquierda - ALTURA FIJA */}
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

      {/* ✅ Texto a la derecha - FLEX */}
      <div className="flex-1 flex flex-col justify-center overflow-auto">
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