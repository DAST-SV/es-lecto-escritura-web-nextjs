import React from "react";
import type { Page } from "@/src/typings/types-page-book/index";

interface Props {
  page: Page;
}

export function SplitLayout({ page }: Props) {
  return (
    <div className="w-full h-full flex items-center justify-center gap-6 p-6">
      {/* Imagen */}
      {page.image && (
        <div className="flex-1 flex items-center justify-center">
          <img
            src={page.image}
            alt={page.title || ""}
            className="max-w-full max-h-[85%] object-contain rounded-lg shadow-lg"
          />
        </div>
      )}

      {/* Texto */}
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