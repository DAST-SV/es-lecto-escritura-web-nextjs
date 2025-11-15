import React, { useRef, useState, useEffect } from "react";

interface PortadaControlsProps {
  onImageChange: (portada: File | null) => void;
  portada?: File | null;
  portadaUrl?: string | null;
}

export const PortadaControls: React.FC<PortadaControlsProps> = ({
  onImageChange,
  portada,
  portadaUrl,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Sincronizar el preview con las props
  useEffect(() => {
    // Si hay un nuevo archivo (File), crear una URL temporal
    if (portada) {
      const tempUrl = URL.createObjectURL(portada);
      setPreviewUrl(tempUrl);
      
      // Cleanup: liberar la URL cuando cambie o se desmonte
      return () => {
        URL.revokeObjectURL(tempUrl);
      };
    } 
    // Si no hay archivo nuevo pero existe una URL en la BD
    else if (portadaUrl) {
      setPreviewUrl(portadaUrl);
    } 
    // Si no hay nada
    else {
      setPreviewUrl(null);
    }
  }, [portada, portadaUrl]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    if (!file) return;
    
    // Notificar al componente padre
    onImageChange(file);

    // Limpiar el input para poder seleccionar el mismo archivo de nuevo
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleRemoveImage = () => {
    // Notificar al componente padre que se eliminó la imagen
    onImageChange(null);

    // Limpiar el input
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  // Determinar el estado actual
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

      {/* Vista previa y controles */}
      {hasAnyImage && previewUrl && (
        <div className="space-y-3">
          {/* Indicador de estado + Preview mini + Botón quitar */}
          <div className="flex items-center gap-3">
            {/* Mini preview cuadrado */}
            <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-300 flex-shrink-0">
              <img
                src={previewUrl}
                alt="preview-portada"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Indicador de estado */}
            <div className="flex-1">
              {hasNewFile && (
                <div className="flex items-center gap-2">
                  <span className="text-green-600 text-lg">✓</span>
                  <p className="text-xs text-green-600 font-semibold">
                    Nueva portada seleccionada
                  </p>
                </div>
              )}
              {hasExistingUrl && (
                <div className="flex items-center gap-2">
                  <span className="text-blue-600 text-lg">ℹ️</span>
                  <p className="text-xs text-blue-600 font-semibold">
                    Usando portada existente
                  </p>
                </div>
              )}
            </div>

            {/* Botón quitar */}
            <button
              onClick={handleRemoveImage}
              type="button"
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 
                       text-sm font-medium transition-colors flex-shrink-0 shadow-sm"
            >
              🗑 Quitar
            </button>
          </div>

          {/* Preview grande (opcional pero recomendado) */}
          <div className="w-full rounded-lg overflow-hidden border-2 border-gray-300 bg-gray-50">
            <img
              src={previewUrl}
              alt="preview-portada-completa"
              className="w-full h-48 object-contain"
            />
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay imagen */}
      {!hasAnyImage && (
        <div className="mt-2 p-3 bg-gray-100 rounded-lg border border-gray-300">
          <p className="text-xs text-gray-600 text-center">
            📌 No hay portada asignada. Sube una imagen para tu libro.
          </p>
        </div>
      )}
    </div>
  );
};