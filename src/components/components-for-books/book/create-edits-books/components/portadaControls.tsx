import React, { useRef, useState } from "react";

interface ImageControlsProps {
  onImageChange: (portada: File | null) => void;
}

export const PortadaControls: React.FC<ImageControlsProps> = ({
  onImageChange,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    if (!file) return;
    onImageChange(file);
    const previewUrl = URL.createObjectURL(file);
    setImageUrl(previewUrl);

    // Limpiar el input para que pueda volver a seleccionar el mismo archivo
    if (inputRef.current) inputRef.current.value = "";


  };

  const handleRemoveImage = () => {
    if (imageUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(imageUrl);
    }
    onImageChange(null)
    setImageUrl(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

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

      {imageUrl && (
        <div className="flex items-center gap-3">
          {/* Mini preview cuadrado */}
          <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-300">
            <img
              src={imageUrl}
              alt="preview-portada"
              className="w-full h-full object-cover"
            />
          </div>

          <button
            onClick={handleRemoveImage}
            type="button"
            className="flex-1 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 
                       text-sm font-medium transition-colors"
          >
            🗑 Quitar Imagen
          </button>
        </div>
      )}
    </div>
  );
};
