import React from "react";
import type { Page } from "@/src/typings/types-page-book/index";

interface Props {
  page: Page;
}

export const TextCenterLayout: React.FC<Props> = ({ page }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 box-border">
      {page.title && (
        <h1 className="text-4xl font-bold mb-4 text-center">{page.title}</h1>
      )}
      {page.text && (
        <p className="text-lg leading-relaxed text-center">{page.text}</p>
      )}
    </div>
  );
};


export default TextCenterLayout;