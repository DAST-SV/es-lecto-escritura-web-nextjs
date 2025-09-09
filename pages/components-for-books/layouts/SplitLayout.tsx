// src/components/layouts/SplitLayout.tsx
import React from "react";
import type { Page } from "@/typings/types-page-book/index";
import { useAudio } from "@/hooks/hooks-page-book/useAudio";

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
              alt={page.title}
              className="max-w-full max-h-[85%] object-contain rounded-lg shadow"
            />
          </div>
        )}

        {/* Right: text */}
        <div className="flex-1 flex flex-col items-start justify-center">
          <h2 className="text-2xl font-bold mb-2 text-left">{page.title}</h2>
          <p className="text-base leading-relaxed">{page.text}</p>
        </div>
      </div>
  );
};
