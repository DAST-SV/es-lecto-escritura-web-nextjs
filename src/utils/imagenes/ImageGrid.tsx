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
  columns?: number; // nueva propiedad: cantidad de columnas (1, 2, 3, 4)
  onClick?: (img: ImageItem) => void;
}

const ImageGrid: React.FC<ImageGridProps> = ({ images, shapeType = 1, columns = 2, onClick }) => {
  // Si se pasa columns, usamos grid-cols-{columns}, sino usamos la lógica anterior
  let gridClass = "grid gap-6";
  if (columns && columns > 0) {
    gridClass += ` grid-cols-1 sm:grid-cols-${columns}`;
  } else if (shapeType === 3) {
    gridClass += " grid-cols-1";
  } else {
    gridClass += " grid-cols-1 sm:grid-cols-2";
  }

  return (
    <div className={gridClass}>
      {images.map((img, index) => (
        <div key={index} className="flex flex-col items-center">
          <img
            src={img.src}
            alt={img.caption}
            className={`w-full object-cover rounded-lg shadow-md ${
              shapeType === 1
                ? "h-auto"
                : shapeType === 2
                ? "aspect-square"
                : "h-auto"
            }`}
            onClick={() => onClick && onClick(img)}
          />
          <p className="mt-2 text-sm text-gray-700 text-center">{img.caption}</p>
          {img.description && <p className="text-sm text-gray-600 text-center">{img.description}</p>}
        </div>
      ))}
    </div>
  );
};

export default ImageGrid;
