import React from "react";
import type { Page } from "@/src/typings/types-page-book/index";

interface Props {
  page: Page;
}

export function CenterImageDownTextLayout({ page }: Props) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6">
      {page.title && (
        <div dangerouslySetInnerHTML={{ __html: page.title }} className="w-full text-center mb-4" />
      )}

      {page.image && (
        <div className="flex-1 flex items-center justify-center w-full mb-4">
          <img
            src={page.image}
            alt={page.title || ""}
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      )}

      {page.text && (
        <div dangerouslySetInnerHTML={{ __html: page.text }} className="w-full text-center" />
      )}
    </div>
  );
}