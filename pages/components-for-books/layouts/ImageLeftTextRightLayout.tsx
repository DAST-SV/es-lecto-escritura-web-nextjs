// src/components/layouts/ImageLeftTextRightLayout.tsx
import React from "react";
import type { Page } from "@/typings/types-page-book/index";

interface Props {
  page: Page;
}

export const ImageLeftTextRightLayout: React.FC<Props> = ({ page }) => {

  return (
    <div className="w-full h-full">
      <div className="flex w-full h-full gap-4">
        {/* Imagen */}
        {page.image && (
          <div className="flex-1 flex items-center justify-center">
            <img
              src={page.image}
              alt={page.title}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        )}

        {/* Texto */}
        <div className="flex-1 flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-2">{page.title}</h2>
          <p className="text-base">{page.text}</p>
        </div>
      </div>
    </div>
  );
};
