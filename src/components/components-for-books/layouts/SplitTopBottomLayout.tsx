// src/components/layouts/SplitTopBottomLayout.tsx
import React from "react";
import type { Page } from "@/src/typings/types-page-book/index";

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
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
       <div>
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

export default SplitTopBottomLayout;