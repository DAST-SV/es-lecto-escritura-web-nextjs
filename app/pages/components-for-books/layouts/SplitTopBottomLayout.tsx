// src/components/layouts/SplitTopBottomLayout.tsx
import React from "react";
import type { Page } from "../../../../typings/types-page-book/index";

interface Props {
  page: Page;
}

export const SplitTopBottomLayout: React.FC<Props> = ({ page }) => {

  return (
    <div className="w-full h-full">
      {page.image && (
        <div className="flex-1 flex items-center justify-center w-full">
          <img
            src={page.image}
            alt={page.title}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
      <div className="flex-1 flex flex-col items-center justify-start mt-2 w-full">
        <h2 className="text-2xl font-bold mb-2">{page.title}</h2>
        <p className="text-base text-center">{page.text}</p>
      </div>
    </div>
  );
};
