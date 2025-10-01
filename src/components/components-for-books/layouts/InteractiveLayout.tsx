// src/components/layouts/InteractiveLayout.tsx
import React from "react";
import type { Page } from "@/src/typings/types-page-book/index";
import { useAudio } from "@/src/hooks/hooks-page-book/useAudio";
import InteractiveGame from "@/src/components/components-for-books/layouts/InteractiveGame";

interface Props {
  page: Page;
}

export const InteractiveLayout: React.FC<Props> = ({ page }) => {
  useAudio(page.audio);

  return (
    <div>
      {page.title && (
        <div dangerouslySetInnerHTML={{ __html: page.title }} />
      )}
      {page.text && (
        <div dangerouslySetInnerHTML={{ __html: page.text }} />
      )}

      {page.interactiveGame ? (
        <InteractiveGame type={page.interactiveGame} items={page.items || []} />
      ) : (
        page.items && (
          <div>
            {page.items.map((it, i) => (
              <button key={i}>
                {it}
              </button>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default InteractiveLayout;
