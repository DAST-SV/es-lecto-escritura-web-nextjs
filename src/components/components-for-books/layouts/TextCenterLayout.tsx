import React from "react";
import type { Page } from "@/src/typings/types-page-book/index";

interface Props {
  page: Page;
}

export const TextCenterLayout: React.FC<Props> = ({ page }) => {
  return (
    <div>
      {page.title && (
        <div dangerouslySetInnerHTML={{ __html: page.title }} />
      )}
      {page.text && (
        <div dangerouslySetInnerHTML={{ __html: page.text }} />
      )}
    </div>
  );
};

export default TextCenterLayout;
