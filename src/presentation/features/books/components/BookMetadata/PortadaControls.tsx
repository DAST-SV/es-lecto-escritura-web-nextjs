import React, { useRef } from "react";

interface PortadaControlsProps {
  onImageChange: (portada: File | null) => void;
  portada?: File | null;
  portadaUrl?: string | null;
}

export function PortadaControls({
  onImageChange,
  portada,
  portadaUrl,
}: PortadaControlsProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    if (!file) return;
    
    onImageChange(file);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleRemoveImage = () => {
    onImageChange(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const hasNewFile = !!portada;
  const hasExistingUrl = !!portadaUrl && !portada;
  const hasAnyImage = hasNewFile || hasExistingUrl;

  return (
    <div className="mb-6 p-4 bg-green-50 rounded-lg">
      <label className="block text-sm font-bold text-gray-700 mb-3">
        🖼 Imagen de portada:
      </label>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 
                  file:rounded-full file:border-0 file:text-sm file:font-semibold 
                  file:bg-green-100 file:text-green-700 hover:file:bg-green-200 
                  cursor-pointer mb-3"
      />

      {hasAnyImage && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 p-3 bg-white rounded-lg border-2 border-gray-200">
            <div className="flex items-center gap-3">
              {hasNewFile && (
                <>
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-lg">✓</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-green-900">
                      Nueva portada seleccionada
                    </p>
                    <p className="text-xs text-green-600">
                      {portada?.name || 'Archivo seleccionado'}
                    </p>
                  </div>
                </>
              )}
              {hasExistingUrl && (
                <>
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-lg">ℹ️</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-900">
                      Usando portada existente
                    </p>
                    <p className="text-xs text-blue-600">
                      Imagen guardada en la base de datos
                    </p>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={handleRemoveImage}
              type="button"
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 
                       text-sm font-medium transition-colors flex-shrink-0 shadow-sm"
            >
              🗑 Quitar
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              💡 <strong>Vista previa:</strong> La imagen de portada aparece en el panel de vista previa.
            </p>
          </div>
        </div>
      )}

      {!hasAnyImage && (
        <div className="mt-2 p-3 bg-gray-100 rounded-lg border border-gray-300">
          <p className="text-xs text-gray-600 text-center">
            📌 No hay portada asignada. Sube una imagen para tu libro.
          </p>
        </div>
      )}
    </div>
  );
}