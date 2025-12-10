'use client';

import React, { useCallback, useState } from 'react';
import { Upload, FileText, X, AlertCircle, CheckCircle } from 'lucide-react';

interface PDFUploadZoneProps {
  onFileSelect: (file: File | null) => void;
  currentFile?: File | null;
  error?: string;
}

export function PDFUploadZone({
  onFileSelect,
  currentFile,
  error
}: PDFUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = (file: File): string | null => {
    if (file.type !== 'application/pdf') {
      return 'Solo se permiten archivos PDF';
    }
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return 'El archivo excede el tamaño máximo de 50MB';
    }
    return null;
  };

  const handleFile = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      alert(validationError);
      onFileSelect(null);
      return;
    }
    onFileSelect(file);
  }, [onFileSelect]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files?.[0]) handleFile(files[0]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.[0]) handleFile(files[0]);
  };

  return (
    <div className="space-y-4">
      {!currentFile ? (
        <div
          onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-8 transition-all cursor-pointer
            ${isDragging ? 'border-blue-500 bg-blue-50 scale-105' : 'border-gray-300 hover:border-blue-400'}
            ${error ? 'border-red-300 bg-red-50' : ''}
          `}
        >
          <input
            type="file"
            id="pdf-upload"
            accept="application/pdf"
            onChange={handleFileInput}
            className="hidden"
          />
          
          <label htmlFor="pdf-upload" className="flex flex-col items-center cursor-pointer">
            <Upload 
              size={48} 
              className={`mb-4 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`}
            />
            <p className="text-lg font-semibold text-gray-700 mb-2">
              {isDragging ? '¡Suelta el PDF aquí!' : 'Arrastra tu PDF'}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              o haz clic para seleccionar
            </p>
            <div className="flex gap-6 text-xs text-gray-400">
              <span>✓ Formato: PDF</span>
              <span>✓ Máx: 50 MB</span>
            </div>
          </label>
        </div>
      ) : (
        <div className="border-2 border-green-500 bg-green-50 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <CheckCircle size={40} className="text-green-600 flex-shrink-0" />
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-green-900 mb-1">
                ✓ PDF Seleccionado
              </p>
              <p className="text-sm text-green-700 break-all font-medium">
                {currentFile.name}
              </p>
              <p className="text-xs text-green-600 mt-2">
                {(currentFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>

            <button
              onClick={() => onFileSelect(null)}
              className="p-2 text-green-700 hover:bg-green-200 rounded-full transition-colors flex-shrink-0"
              title="Eliminar"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-green-300">
            <label
              htmlFor="pdf-change"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer text-sm font-medium"
            >
              <Upload size={16} />
              Cambiar PDF
            </label>
            <input
              type="file"
              id="pdf-change"
              accept="application/pdf"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 font-medium">{error}</p>
        </div>
      )}
    </div>
  );
}