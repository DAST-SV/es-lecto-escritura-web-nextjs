// src/components/layouts/CoverLayout.tsx
import React from "react";
import type { Page } from "@/src/typings/types-page-book/index";

interface Props {
  page: Page;
}

export const CoverLayout: React.FC<Props> = ({ page }) => {
  return (
    <div className="w-full h-full">
      {/* Imagen de fondo */}
      {page.image && (
        <img
          src={page.image}
          alt={page.title || ""}
          className="absolute top-0 left-0 w-full h-full object-cover"
        />
      )}

      {/* Texto superpuesto */}
      <div className="relative z-10 text-center px-4">
        {page.title && (
          <div dangerouslySetInnerHTML={{ __html: page.title }} />
        )}

        {page.text && (
          <div dangerouslySetInnerHTML={{ __html: page.text }} />
        )}
      </div>
    </div>
  );
};

export default CoverLayout;
