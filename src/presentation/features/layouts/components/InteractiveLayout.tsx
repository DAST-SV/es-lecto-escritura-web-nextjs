import React from "react";
import type { Page } from "@/src/typings/types-page-book/index";
import { InteractiveGame } from "./InteractiveGame";

interface Props {
  page: Page;
}

export function InteractiveLayout({ page }: Props) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6">
      {page.title && (
        <div dangerouslySetInnerHTML={{ __html: page.title }} className="w-full text-center mb-4" />
      )}
      
      {page.text && (
        <div dangerouslySetInnerHTML={{ __html: page.text }} className="w-full text-center mb-6" />
      )}

      {page.interactiveGame && page.items ? (
        <InteractiveGame type={page.interactiveGame} items={page.items} />
      ) : page.items ? (
        <div className="flex flex-wrap gap-3 justify-center">
          {page.items.map((item, i) => (
            <button
              key={i}
              className="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors shadow-md"
            >
              {item}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}