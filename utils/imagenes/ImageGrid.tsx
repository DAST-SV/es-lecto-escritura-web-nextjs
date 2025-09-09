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
  size?: 
    | "gigante"
    | "extra-grande"
    | "muy-grande"
    | "grande"
    | "grande-mediano"
    | "mediano-grande"
    | "mediano"
    | "mediano-pequeño"
    | "pequeño"
    | "muy-pequeño";  // Tamaños predefinidos
  customSize?: { width: number; height: number }; // Tamaño exacto en px
  align?: "left" | "center" | "right";
  columns?: number; // opcional: número de columnas
  rows?: number;    // opcional: número máximo de filas
  onClick?: (img: ImageItem) => void;
}

const ImageGrid: React.FC<ImageGridProps> = ({
  images,
  shapeType = 1,
  size = "mediano",
  customSize,
  align = "center",
  columns,
  rows,
  onClick,
}) => {
  const normalizedSize = size.toLowerCase().replace(/\s+/g, "-");
  const normalizedAlign = align.toLowerCase().replace(/\s+/g, "-");

  const sizeMap: Record<string, string> = {
    gigante: "w-52 h-52",
    "extra-grande": "w-48 h-48",
    "muy-grande": "w-40 h-40",
    grande: "w-36 h-36",
    "grande-mediano": "w-32 h-32",
    "mediano-grande": "w-28 h-28",
    mediano: "w-24 h-24",
    "mediano-pequeño": "w-20 h-20",
    pequeño: "w-16 h-16",
    "muy-pequeño": "w-12 h-12",
  };

  const alignMap: Record<string, string> = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  };

  // Tamaño final del contenedor
  const sizeClass = sizeMap[normalizedSize] || sizeMap.mediano;
  const justifyClass = alignMap[normalizedAlign] || alignMap.center;

  // Estilos dinámicos para grid si se pasan columnas o filas
  const gridStyle: React.CSSProperties = {};
  if (columns) gridStyle.gridTemplateColumns = `repeat(${columns}, minmax(0, 1fr))`;
  if (rows) gridStyle.gridTemplateRows = `repeat(${rows}, auto)`;

  // Estilo directo para la imagen si se pasa customSize
  const imgStyle = customSize
    ? { width: `${customSize.width}px`, height: `${customSize.height}px` }
    : undefined;

  const containerClass = columns
    ? `grid gap-4 ${justifyClass}`
    : `flex flex-wrap gap-4 ${justifyClass}`;

  return (
    <div className={containerClass} style={columns ? gridStyle : undefined}>
      {images.map((img, index) => (
        <div key={index} className={`flex flex-col items-center ${!customSize ? sizeClass : ""}`}>
          <img
            src={img.src}
            alt={img.caption}
            style={imgStyle}
            className={`object-cover rounded-lg shadow-md ${
              shapeType === 2 ? "aspect-square" : ""
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
