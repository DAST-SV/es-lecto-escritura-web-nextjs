// src/components/layouts/CenterImageDownTextLayout.tsx
import React from "react";
import type { Page } from "@/src/typings/types-page-book/index";
import { useAudio } from "@/src/hooks/hooks-page-book/useAudio";

interface Props {
  page: Page;
}

export const CenterImageDownTextLayout: React.FC<Props> = ({ page }) => {
  useAudio(page.audio);

  return (
    <div>
      {page.title && (
        <div dangerouslySetInnerHTML={{ __html: page.title }} />
      )}

      {page.image && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <img
            src={page.image}
            alt={page.title || ""}
          />
        </div>
      )}

      {page.text && (
        <div dangerouslySetInnerHTML={{ __html: page.text }} />
      )}
    </div>
  );
};

export default CenterImageDownTextLayout;
