import React from "react";
import type { Page } from "@/src/typings/types-page-book/index";

interface Props {
  page: Page;
}

// ============================================
// 5. CenterImageDownTextLayout.tsx
// ============================================
export function CenterImageDownTextLayout({ page }: Props) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 gap-4">
      {page.title && (
        <div dangerouslySetInnerHTML={{ __html: page.title }} className="w-full text-center" />
      )}

      {/* ✅ Imagen - 60% altura */}
      {page.image && (
        <div className="w-full flex items-center justify-center" style={{ height: '60%' }}>
          <img
            src={page.image}
            alt={page.title || ""}
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      )}

      {/* ✅ Texto abajo */}
      {page.text && (
        <div dangerouslySetInnerHTML={{ __html: page.text }} className="w-full text-center overflow-auto" />
      )}
    </div>
  );
}