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
          alt={page.title}
          className="absolute top-0 left-0 w-full h-full object-cover"
        />
      )}

      {/* Texto superpuesto */}
      <div className="relative z-10 text-cente px-4">
        <h1 className="text-4xl font-bold">{page.title}</h1>
        {page.text && <p className="text-lg mt-2">{page.text}</p>}
      </div>
    </div>
  );
};

export default CoverLayout;