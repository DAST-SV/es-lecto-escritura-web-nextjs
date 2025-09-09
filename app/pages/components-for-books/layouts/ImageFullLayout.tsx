// src/components/layouts/ImageFullLayout.tsx
import React from "react";
import type { Page } from "../../../../typings/types-page-book/index";

interface Props {
  page: Page;
}

export const ImageFullLayout: React.FC<Props> = ({ page }) => {
  return (
    <div className="w-full h-full">
      {page.image && (
        <img
          src={page.image}
          alt={page.title}
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
};