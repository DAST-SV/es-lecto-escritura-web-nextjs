import React, { useState, useCallback } from 'react';
import { Upload, Image as ImageIcon, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface DragDropImageZoneProps {
  onImageUpload: (file: File) => void;
  currentImage?: string | null;
  onRemoveImage?: () => void;
  maxSizeMB?: number;
  acceptedFormats?: string[];
}

export function DragDropImageZone({
  onImageUpload,
  currentImage,
  onRemoveImage,
  maxSizeMB = 5,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
}: DragDropImageZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const validateFile = useCallback((file: File): boolean => {
    // Validar tipo
    if (!acceptedFormats.includes(file.type)) {
      toast.error('❌ Formato no permitido. Usa JPG, PNG, GIF o WebP');
      return false;
    }

    // Validar tamaño
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      toast.error(`❌ La imagen es muy grande. Máximo ${maxSizeMB}MB`);
      return false;
    }

    return true;
  }, [acceptedFormats, maxSizeMB]);

  const handleFile = useCallback(async (file: File) => {
    if (!validateFile(file)) return;

    setIsProcessing(true);
    try {
      await onImageUpload(file);
      toast.success('✅ Imagen cargada correctamente');
    } catch (error) {
      toast.error('❌ Error al cargar la imagen');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  }, [validateFile, onImageUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  return (
    <div className="relative">
      {currentImage ? (
        // Mostrar imagen actual
        <div className="relative group">
          <div className="aspect-video rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50">
            <img
              src={currentImage}
              alt="Imagen cargada"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Overlay con acciones */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
            <label className="px-4 py-2 bg-white text-gray-800 rounded-lg font-medium cursor-pointer hover:bg-gray-100 transition flex items-center gap-2">
              <Upload size={16} />
              Cambiar
              <input
                type="file"
                accept={acceptedFormats.join(',')}
                onChange={handleFileInput}
                className="hidden"
              />
            </label>

            {onRemoveImage && (
              <button
                onClick={onRemoveImage}
                className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition flex items-center gap-2"
              >
                <X size={16} />
                Quitar
              </button>
            )}
          </div>

          {/* Badge de confirmación */}
          <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1.5 shadow-lg">
            <Check size={14} strokeWidth={3} />
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
            block aspect-video rounded-lg border-2 border-dashed transition-all cursor-pointer
            ${isDragging 
              ? 'border-indigo-500 bg-indigo-50 scale-105' 
              : 'border-gray-300 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50/50'
            }
            ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
          `}
        >
          <div className="h-full flex flex-col items-center justify-center p-6 text-center">
            {isProcessing ? (
              <>
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-3" />
                <p className="text-sm font-medium text-gray-700">Procesando imagen...</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-3">
                  {isDragging ? (
                    <Upload size={32} className="text-indigo-600 animate-bounce" />
                  ) : (
                    <ImageIcon size={32} className="text-indigo-500" />
                  )}
                </div>

                <p className="text-sm font-semibold text-gray-800 mb-1">
                  {isDragging ? '¡Suelta aquí!' : 'Arrastra una imagen'}
                </p>

                <p className="text-xs text-gray-600 mb-3">
                  o haz clic para seleccionar
                </p>

                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition">
                  <Upload size={14} />
                  Seleccionar archivo
                </div>

                <p className="text-[10px] text-gray-500 mt-3">
                  JPG, PNG, GIF o WebP • Máx. {maxSizeMB}MB
                </p>
              </>
            )}
          </div>

          <input
            type="file"
            accept={acceptedFormats.join(',')}
            onChange={handleFileInput}
            className="hidden"
            disabled={isProcessing}
          />
        </label>
      )}
    </div>
  );
}