import React from "react";

export interface ImageItem {
  src: string;
  caption: string;
  description?: string;
  Json?: string;
}

interface ImageGridProps {
  images: ImageItem[];
  shapeType?: number; // 1 = rectangular, 2 = cuadrado, 3 = columna
  columns?: number;   // cantidad de columnas (1, 2, 3, 4)
  onClick?: (img: ImageItem) => void;
  showButton?: boolean;
  onButtonClick?: (img: ImageItem) => void;
  buttonText?: string;
  buttonColor?: string;
  buttonPosition?: "bottom" | "corner"; // 🔹 nueva prop para posicion del botón
}

const ImageGrid: React.FC<ImageGridProps> = ({
  images,
  shapeType = 1,
  columns,
  onClick,
  showButton = false,
  onButtonClick,
  buttonText = "Acción",
  buttonColor = "red",
  buttonPosition = "bottom",
}) => {
  const colClasses: Record<number, string> = {
    1: "grid-cols-1",
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-3",
    4: "sm:grid-cols-4",
  };

  const gridClass = `grid gap-6 ${columns && columns > 0 ? colClasses[columns] : shapeType === 3 ? "grid-cols-1" : "sm:grid-cols-2"}`;

  return (
    <div className={gridClass}>
      {images.map((img, index) => (
        <div
          key={index}
          className="relative flex flex-col items-center bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden"
        >
          {/* Imagen */}
          <img
            src={img.src}
            alt={img.caption}
            className={`w-full object-cover cursor-pointer ${
              shapeType === 1 ? "h-auto" : shapeType === 2 ? "aspect-square" : "h-auto"
            }`}
            onClick={() => onClick && onClick(img)}
          />

          {/* Botón en esquina superior */}
          {showButton && buttonPosition === "corner" && (
            <button
              onClick={() => onButtonClick && onButtonClick(img)}
              className={`absolute top-2 right-2 bg-${buttonColor}-500 text-white px-3 py-1 rounded-full hover:bg-${buttonColor}-600 transition`}
              title={buttonText}
            >
              {buttonText}
            </button>
          )}

          {/* Texto debajo */}
          <div className="p-3 w-full flex flex-col items-center">
            <p className="text-sm font-semibold text-gray-800 text-center">{img.caption}</p>
            {img.description && (
              <p className="text-sm text-gray-500 text-center mt-1">{img.description}</p>
            )}

            {/* Botón abajo */}
            {showButton && buttonPosition === "bottom" && (
              <button
                onClick={() => onButtonClick && onButtonClick(img)}
                className={`mt-3 px-4 py-2 bg-${buttonColor}-500 text-white rounded-lg hover:bg-${buttonColor}-600 transition`}
              >
                {buttonText}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImageGrid;
