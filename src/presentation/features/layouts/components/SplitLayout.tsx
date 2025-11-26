import React from "react";
import { Page } from "@/src/core/domain/types";

interface Props {
  page: Page;
}

// ============================================
// 4. SplitLayout.tsx
// ============================================
export function SplitLayout({ page }: Props) {
  return (
    <div className="w-full h-full flex items-center justify-center gap-6 p-6">
      {/* ✅ Imagen - 50% ancho */}
      {page.image && (
        <div className="w-1/2 h-full flex items-center justify-center">
          <img
            src={page.image}
            alt={page.title || ""}
            className="w-full h-full object-contain rounded-lg"
          />
        </div>
      )}

      {/* ✅ Texto - 50% ancho */}
      <div className="w-1/2 flex flex-col justify-center overflow-auto">
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