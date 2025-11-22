import React from 'react';
import type { page } from '@/src/typings/types-page-book/index';
import { layoutRegistry } from '@/src/presentation/features/layouts/registry';

interface LayoutPreviewProps {
  page: page;
  layoutId: string;
}

export function LayoutPreview({ page, layoutId }: LayoutPreviewProps) {
  const Layout = layoutRegistry[layoutId as keyof typeof layoutRegistry] || layoutRegistry.TextCenterLayout;

  // Convertir page a Page (tipo del dominio)
  const convertedPage = {
    layout: page.layout as any,
    title: page.title,
    text: page.text,
    image: page.image,
    background: page.background as any,
  };

  return (
    <div className="w-full h-full bg-white overflow-auto">
      <div className="p-4 scale-75 origin-top-left">
        {/* @ts-ignore - Tipo simplificado para preview */}
        <Layout page={convertedPage} />
      </div>
    </div>
  );
}