import React from "react";
import type { Page } from "@/src/typings/types-page-book/index";

interface Props {
  page: Page;
}

export function TextCenterLayout({ page }: Props) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-8 py-6">
      {page.title && (
        <div 
          dangerouslySetInnerHTML={{ __html: page.title }}
          className="w-full text-center mb-4"
        />
      )}
      
      {page.text && (
        <div 
          dangerouslySetInnerHTML={{ __html: page.text }}
          className="w-full text-center"
        />
      )}
    </div>
  );
}