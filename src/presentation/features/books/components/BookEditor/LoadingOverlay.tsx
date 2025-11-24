/**
 * UBICACIÓN: src/presentation/features/books/components/BookEditor/LoadingOverlay.tsx
 * 
 * Overlay de carga que bloquea toda la interacción
 */

import React from 'react';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface LoadingOverlayProps {
  isVisible: boolean;
  status: 'loading' | 'success' | 'error';
  message?: string;
}

export function LoadingOverlay({ isVisible, status, message }: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all">
        <div className="flex flex-col items-center text-center space-y-4">
          
          {/* Icon */}
          {status === 'loading' && (
            <div className="relative">
              <Loader2 size={64} className="text-indigo-600 animate-spin" />
              <div className="absolute inset-0 bg-indigo-100 rounded-full blur-xl opacity-50 animate-pulse" />
            </div>
          )}

          {status === 'success' && (
            <div className="relative">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-scale-in">
                <CheckCircle size={48} className="text-green-600" strokeWidth={2.5} />
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="relative">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center animate-shake">
                <AlertCircle size={48} className="text-red-600" strokeWidth={2.5} />
              </div>
            </div>
          )}

          {/* Message */}
          <div>
            <h3 className={`text-xl font-bold mb-2 ${
              status === 'loading' ? 'text-gray-900' :
              status === 'success' ? 'text-green-900' :
              'text-red-900'
            }`}>
              {status === 'loading' && 'Guardando libro...'}
              {status === 'success' && '¡Libro guardado!'}
              {status === 'error' && 'Error al guardar'}
            </h3>
            
            {message && (
              <p className="text-sm text-gray-600">{message}</p>
            )}

            {status === 'loading' && (
              <p className="text-xs text-gray-500 mt-2">
                Por favor espera, no cierres esta ventana
              </p>
            )}

            {status === 'success' && (
              <p className="text-xs text-green-600 mt-2">
                Redirigiendo en un momento...
              </p>
            )}
          </div>

          {/* Progress indicator */}
          {status === 'loading' && (
            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full animate-progress" />
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-10px);
          }
          75% {
            transform: translateX(10px);
          }
        }

        @keyframes progress {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }

        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}