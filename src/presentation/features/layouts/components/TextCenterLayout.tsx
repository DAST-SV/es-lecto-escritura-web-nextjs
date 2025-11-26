/**
 * ============================================
 * LAYOUTS - INTERFAZ LIMPIA
 * Todos los layouts usan el mismo tipo Page
 * ============================================
 */

import React from "react";
import { Page } from "@/src/core/domain/types";

interface Props {
  page: Page;
}

// ============================================
// 1. TextCenterLayout
// ============================================
export function TextCenterLayout({ page }: Props) {
  return (
    <div className="w-full h-full flex flex-col">
      {page.title && (
        <div 
          dangerouslySetInnerHTML={{ __html: page.title }}
          className="w-full"
        />
      )}
      
      {page.text && (
        <div 
          dangerouslySetInnerHTML={{ __html: page.text }}
          className="w-full flex-1"
        />
      )}
    </div>
  );
}