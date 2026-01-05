/**
 * UBICACIÓN: src/presentation/features/layouts/components/PageRenderer.tsx
 * Versión simplificada para preview de PDFs
 */

import React from 'react';
import { Page } from '@/src/core/domain/types';

interface PageRendererProps {
  page: Page;
  isActive?: boolean;
}

export const PageRenderer: React.FC<PageRendererProps> = ({ page, isActive = true }) => {
  // Para ImageFullLayout (PDFs convertidos)
  if (page.layout === 'ImageFullLayout' && page.image) {
    return (
      <div className="w-full h-full relative bg-white overflow-hidden">
        <img
          src={page.image}
          alt={page.title || 'Página'}
          className="w-full h-full object-contain"
          style={{
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        />
      </div>
    );
  }

  // Para TextCenterLayout
  if (page.layout === 'TextCenterLayout') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-white">
        {page.title && (
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            {page.title}
          </h2>
        )}
        {page.text && (
          <p className="text-gray-700 text-center whitespace-pre-wrap">
            {page.text}
          </p>
        )}
      </div>
    );
  }

  // Para TextLeftImageRightLayout
  if (page.layout === 'TextLeftImageRightLayout') {
    return (
      <div className="w-full h-full flex bg-white">
        <div className="w-1/2 flex flex-col items-center justify-center p-6">
          {page.title && (
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              {page.title}
            </h2>
          )}
          {page.text && (
            <p className="text-gray-700 text-sm whitespace-pre-wrap">
              {page.text}
            </p>
          )}
        </div>
        <div className="w-1/2 relative">
          {page.image && (
            <img
              src={page.image}
              alt={page.title || 'Imagen'}
              className="w-full h-full object-cover"
            />
          )}
        </div>
      </div>
    );
  }

  // Fallback: mostrar lo que haya disponible
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-white">
      {page.image ? (
        <img
          src={page.image}
          alt={page.title || 'Página'}
          className="max-w-full max-h-full object-contain"
        />
      ) : (
        <>
          {page.title && (
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              {page.title}
            </h2>
          )}
          {page.text && (
            <p className="text-gray-700 text-center whitespace-pre-wrap">
              {page.text}
            </p>
          )}
        </>
      )}
    </div>
  );
};