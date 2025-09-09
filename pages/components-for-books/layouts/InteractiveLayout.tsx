// src/components/layouts/InteractiveLayout.tsx
import React from "react";
import type { Page } from "@/typings/types-page-book/index";
import { useAudio } from "@/hooks/hooks-page-book/useAudio";
import  InteractiveGame  from "../book/InteractiveGame";

interface Props {
  page: Page;
}

export const InteractiveLayout: React.FC<Props> = ({ page }) => {
  useAudio(page.audio);

  return (
    <div className="w-full h-full">
      <h2 className="text-2xl font-bold mb-3 text-center">{page.title}</h2>
      <p className="text-base text-center mb-4">{page.text}</p>

      {page.interactiveGame ? (
        <InteractiveGame type={page.interactiveGame} items={page.items || []} />
      ) : (
        page.items && (
          <div className="flex gap-4">
            {page.items.map((it, i) => (
              <button key={i} className="bg-indigo-500 text-white px-4 py-2 rounded">
                {it}
              </button>
            ))}
          </div>
        )
      )}
    </div>
  );
};
