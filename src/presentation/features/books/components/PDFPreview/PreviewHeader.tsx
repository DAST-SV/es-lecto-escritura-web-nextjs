/**
 * UBICACIÓN: src/presentation/features/books/components/PDFPreview/PreviewHeader.tsx
 * Header: Título izquierda + Total páginas + Solo botón Cerrar
 */

import React from 'react';
import { X } from 'lucide-react';

interface PreviewHeaderProps {
  title: string;
  totalPages: number;
  isVisible: boolean;
  onClose: () => void;
}

export function PreviewHeader({
  title,
  totalPages,
  isVisible,
  onClose,
}: PreviewHeaderProps) {
  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-[10000] transition-all duration-300 pointer-events-none ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)',
        padding: '8px 12px'
      }}
    >
      <div className="flex items-center justify-between">
        {/* Izquierda: Cerrar + Título */}
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-1.5 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white rounded-md transition-all pointer-events-auto"
            title="Salir (ESC)"
          >
            <X size={14} />
          </button>
          <span className="text-white text-xs sm:text-sm font-medium pointer-events-auto select-text cursor-text">
            {title || 'Sin título'}
          </span>
          <span className="text-white/50 text-xs pointer-events-auto select-text cursor-text">
            • {totalPages} pág.
          </span>
        </div>

        {/* Derecha: Vacío (sin botón guardar) */}
        <div />
      </div>
    </div>
  );
}