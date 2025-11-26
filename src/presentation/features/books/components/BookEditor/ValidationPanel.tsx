/**
 * UBICACIÓN: src/presentation/features/books/components/BookEditor/ValidationPanel.tsx
 * SIMPLIFICADO: Panel de validación rápido y directo
 */

import React from 'react';
import { X, AlertCircle } from 'lucide-react';

interface ValidationError {
  field: string;
  message: string;
}

interface ValidationPanelProps {
  isOpen: boolean;
  errors: ValidationError[];
  onClose: () => void;
}

export function ValidationPanel({ isOpen, errors, onClose }: ValidationPanelProps) {
  if (!isOpen || errors.length === 0) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 z-[10000]" // ✅ Aumentado z-index
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-4 top-20 w-80 bg-white rounded-xl shadow-2xl z-[10001] border-2 border-amber-200"> {/* ✅ Aumentado z-index */}
        {/* Header */}
        <div className="px-4 py-3 bg-amber-50 border-b border-amber-200 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="text-amber-600" size={20} />
            <h3 className="font-bold text-gray-900 text-sm">
              Validación del Libro
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-amber-100 rounded transition-colors"
          >
            <X size={18} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-96 overflow-y-auto">
          <p className="text-xs text-amber-800 mb-3 font-medium">
            Completa los siguientes campos para guardar:
          </p>

          <div className="space-y-2">
            {errors.map((error, index) => (
              <div
                key={index}
                className="flex items-start gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg"
              >
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-xs">
                    {error.field}
                  </p>
                  <p className="text-xs text-gray-600">
                    {error.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <button
            onClick={onClose}
            className="w-full px-3 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg hover:bg-gray-900 transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </>
  );
}