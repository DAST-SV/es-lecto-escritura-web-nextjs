// src/components/layouts/SplitLayout.tsx
import React from "react";
import type { Page } from "@/src/typings/types-page-book/index";
import { useAudio } from "@/src/hooks/hooks-page-book/useAudio";

interface Props {
  page: Page;
}

export const SplitLayout: React.FC<Props> = ({ page }) => {
  useAudio(page.audio);

  return (

      <div className="w-full h-full flex items-center justify-center gap-4">
        {/* Left: image */}
        {page.image && (
          <div className="flex-1 flex items-center justify-center">
            <img
              src={page.image}
              className="max-w-full max-h-[85%] object-contain rounded-lg shadow"
            />
          </div>
        )}

        {/* Right: text */}
        <div className="flex-1 flex flex-col items-start justify-center">
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

export default SplitLayout;