/**
 * UBICACIÓN: src/presentation/features/books/components/BookEditor/ValidationPanel.tsx
 */

import React from 'react';
import { X, AlertCircle, CheckCircle2 } from 'lucide-react';

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
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {errors.length > 0 ? (
              <AlertCircle className="text-amber-500" size={20} />
            ) : (
              <CheckCircle2 className="text-green-500" size={20} />
            )}
            <h3 className="font-semibold text-slate-900">
              {errors.length > 0 ? 'Validación pendiente' : 'Todo listo'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-200 rounded transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {errors.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs text-slate-600 mb-3">
                Completa los siguientes campos antes de guardar:
              </p>
              {errors.map((error, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg"
                >
                  <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={16} />
                  <div>
                    <p className="font-medium text-amber-900 text-sm">{error.field}</p>
                    <p className="text-xs text-amber-700 mt-0.5">{error.message}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <CheckCircle2 className="text-green-500 mb-3" size={48} />
              <p className="font-medium text-slate-900">¡Perfecto!</p>
              <p className="text-sm text-slate-600 mt-1">
                Todos los campos están completos
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}