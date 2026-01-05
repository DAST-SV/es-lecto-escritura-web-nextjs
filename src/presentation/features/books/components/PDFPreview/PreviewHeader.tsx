/**
 * UBICACIÓN: src/presentation/features/books/components/PDFPreview/PreviewHeader.tsx
 * Header: Título izquierda + Total páginas estático
 */

import React from 'react';
import { X, Save, Loader2 } from 'lucide-react';

interface PreviewHeaderProps {
  title: string;
  totalPages: number;
  isVisible: boolean;
  isLoading: boolean;
  isSaveDisabled: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function PreviewHeader({
  title,
  totalPages,
  isVisible,
  isLoading,
  isSaveDisabled,
  onClose,
  onSave,
}: PreviewHeaderProps) {
  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-[10000] transition-all duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
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
            className="p-1.5 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white rounded-md transition-all"
            title="Salir (ESC)"
          >
            <X size={14} />
          </button>
          <span className="text-white text-xs sm:text-sm font-medium">
            {title || 'Sin título'}
          </span>
          <span className="text-white/50 text-xs">
            • {totalPages} pág.
          </span>
        </div>

        {/* Derecha: Guardar */}
        <button
          onClick={onSave}
          disabled={isLoading || isSaveDisabled}
          className="px-2.5 py-1 bg-green-600/90 hover:bg-green-700 backdrop-blur-sm text-white rounded-md transition-all flex items-center gap-1 disabled:opacity-50 text-xs"
        >
          {isLoading ? (
            <>
              <Loader2 size={12} className="animate-spin" />
              <span className="hidden sm:inline">Guardando...</span>
            </>
          ) : (
            <>
              <Save size={12} />
              <span className="hidden sm:inline">Guardar</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}