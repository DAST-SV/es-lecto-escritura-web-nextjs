/**
 * UBICACIÓN: src/presentation/features/books/components/BookReader/BookReader.tsx
 * ✅ COMPONENTE REUTILIZABLE: Solo lectura con flipbook
 */

'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import HTMLFlipBook from 'react-pageflip';
import type { Page } from '@/src/core/domain/types';

interface BookReaderProps {
  pages: Page[];
  title: string;
  pdfDimensions: { width: number; height: number };
  onClose: () => void;
}

export function BookReader({ pages, title, pdfDimensions, onClose }: BookReaderProps) {
  const [currentPage, setCurrentPage] = useState(0);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col">
      {/* Header simplificado */}
      <div className="bg-slate-800/90 backdrop-blur-sm border-b border-slate-700/50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700/50 rounded-xl transition-colors"
            title="Cerrar"
          >
            <X size={24} className="text-white" />
          </button>
          
          <div>
            <h1 className="text-xl font-bold text-white">{title}</h1>
            <p className="text-sm text-slate-400">Modo lectura</p>
          </div>
        </div>

        <div className="text-sm text-slate-400">
          Página {currentPage + 1} de {pages.length}
        </div>
      </div>

      {/* FlipBook */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
        <div className="relative" style={{ 
          width: `${pdfDimensions.width * 2}px`,
          height: `${pdfDimensions.height}px`,
          maxWidth: '90vw',
          maxHeight: '80vh'
        }}>
          <HTMLFlipBook
            width={pdfDimensions.width}
            height={pdfDimensions.height}
            size="stretch"
            minWidth={300}
            maxWidth={800}
            minHeight={400}
            maxHeight={1000}
            showCover={true}
            flippingTime={600}
            usePortrait={false}
            startPage={0}
            drawShadow={true}
            useMouseEvents={true}
            swipeDistance={30}
            clickEventForward={true}
            mobileScrollSupport={true}
            onFlip={(e: any) => setCurrentPage(e.data)}
            className="shadow-2xl"
            style={{}}
            startZIndex={0}
            autoSize={true}
            maxShadowOpacity={0.5}
            showPageCorners={true}
            disableFlipByClick={false}
          >
            {pages.map((page, index) => (
              <div 
                key={page.id || index} 
                className="bg-white shadow-xl"
                style={{
                  width: `${pdfDimensions.width}px`,
                  height: `${pdfDimensions.height}px`,
                  overflow: 'hidden'
                }}
              >
                {page.image && (
                  <img
                    src={page.image}
                    alt={`Página ${index + 1}`}
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
            ))}
          </HTMLFlipBook>
        </div>
      </div>
    </div>
  );
}