import React from "react";
import type { Page } from "@/src/typings/types-page-book/index";

interface Props {
  page: Page;
}

// ============================================
// 3. SplitTopBottomLayout.tsx
// ============================================
export function SplitTopBottomLayout({ page }: Props) {
  return (
    <div className="w-full h-full flex flex-col p-6 gap-4">
      {/* ✅ Imagen arriba - 60% altura */}
      {page.image && (
        <div className="w-full flex items-center justify-center" style={{ height: '60%' }}>
          <img
            src={page.image}
            alt={page.title || ""}
            className="w-full h-full object-contain rounded-lg"
          />
        </div>
      )}

      {/* ✅ Texto abajo - 40% altura */}
      <div className="flex-1 overflow-auto">
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