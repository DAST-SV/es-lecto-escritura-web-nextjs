/**
 * UBICACIÓN: src/presentation/features/books/components/PDFUpload/PDFUploadZone.tsx
 * ✅ Componente drag-and-drop para subir PDFs
 */

'use client';

import React, { useState, useCallback } from 'react';
import { Upload, FileText, X, Check, AlertCircle } from 'lucide-react';

interface PDFUploadZoneProps {
  onFileSelect: (file: File | null) => void | Promise<void>; // ⬅️ CORREGIDO: Aceptar async
  currentFile: File | null;
  error?: string;
}

export function PDFUploadZone({
  onFileSelect,
  currentFile,
  error
}: PDFUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = useCallback((file: File): string | null => {
    // Validar tipo
    if (file.type !== 'application/pdf') {
      return 'Solo se permiten archivos PDF';
    }

    // Validar tamaño (50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return 'El archivo es muy grande. Máximo 50MB';
    }

    return null;
  }, []);

  const handleFile = useCallback(async (file: File) => { // ⬅️ CORREGIDO: async
    const error = validateFile(file);
    if (error) {
      await onFileSelect(null); // ⬅️ CORREGIDO: await
      return;
    }
    await onFileSelect(file); // ⬅️ CORREGIDO: await
  }, [validateFile, onFileSelect]);

  const handleDrop = useCallback(async (e: React.DragEvent) => { // ⬅️ CORREGIDO: async
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      await handleFile(file); // ⬅️ CORREGIDO: await
    }
  }, [handleFile]);

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => { // ⬅️ CORREGIDO: async
    const file = e.target.files?.[0];
    if (file) {
      await handleFile(file); // ⬅️ CORREGIDO: await
    }
  }, [handleFile]);

  const handleRemove = useCallback(async () => { // ⬅️ CORREGIDO: async
    await onFileSelect(null); // ⬅️ CORREGIDO: await
  }, [onFileSelect]);

  return (
    <div className="space-y-3">
      {currentFile ? (
        // Archivo seleccionado
        <div className="relative">
          <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText size={24} className="text-green-600" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-green-900 truncate">
                  {currentFile.name}
                </p>
                <p className="text-xs text-green-700 mt-1">
                  {(currentFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>

              <button
                onClick={handleRemove}
                className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Quitar archivo"
              >
                <X size={20} />
              </button>
            </div>

            {/* Check badge */}
            <div className="absolute top-2 right-2">
              <div className="bg-green-500 text-white rounded-full p-1">
                <Check size={16} strokeWidth={3} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Zona de drop
        <label
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          className={`
            block cursor-pointer transition-all
            ${isDragging 
              ? 'border-indigo-500 bg-indigo-50 scale-105' 
              : error
                ? 'border-red-400 bg-red-50'
                : 'border-gray-300 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50/50'
            }
          `}
        >
          <div className="border-2 border-dashed rounded-lg p-8">
            <div className="flex flex-col items-center text-center">
              <div className={`
                w-16 h-16 rounded-full flex items-center justify-center mb-4
                ${isDragging 
                  ? 'bg-indigo-200' 
                  : error 
                    ? 'bg-red-200' 
                    : 'bg-indigo-100'
                }
              `}>
                {isDragging ? (
                  <Upload size={32} className="text-indigo-600 animate-bounce" />
                ) : error ? (
                  <AlertCircle size={32} className="text-red-600" />
                ) : (
                  <FileText size={32} className="text-indigo-500" />
                )}
              </div>

              <p className="text-sm font-semibold text-gray-800 mb-1">
                {isDragging 
                  ? '¡Suelta el archivo aquí!' 
                  : error
                    ? 'Archivo inválido'
                    : 'Arrastra tu PDF aquí'
                }
              </p>

              <p className="text-xs text-gray-600 mb-4">
                o haz clic para seleccionar
              </p>

              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition">
                <Upload size={14} />
                Seleccionar PDF
              </div>

              <p className="text-[10px] text-gray-500 mt-4">
                Solo PDF • Máximo 50MB
              </p>
            </div>
          </div>

          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileInput}
            className="hidden"
          />
        </label>
      )}

      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}