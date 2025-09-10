// src/components/layouts/FullPageLayout.tsx
import React from "react";
import type { Page } from "@/src/typings/types-page-book/index";
import { useAudio } from "@/src/hooks/hooks-page-book/useAudio";

interface Props {
  page: Page;
}

export const FullPageLayout: React.FC<Props> = ({ page }) => {
  useAudio(page.audio);

  return (
    <div className="w-full h-full">
      <h2 className="text-3xl font-bold mb-4 text-center">{page.title}</h2>
      {page.image && (
        <img
          src={page.image}
          alt={page.title}
          className="max-w-full max-h-[65%] object-contain rounded-lg shadow mb-4"
        />
      )}
      <p className="text-base max-w-[85%] text-center">{page.text}</p>
    </div>
  );
};

export default FullPageLayout;