'use client'

import React from "react";
import Image, { StaticImageData } from "next/image";

export interface ImageItem {
  src?: string | StaticImageData;
  component?: React.ReactNode;
  caption?: string;
  description?: string;
  Json?: string;
}

interface ImageGridProps {
  images: ImageItem[];
  shapeType?: number;
  columns?: number;
  aspectRatio?: string; // ej: "3/2" o "1/1"
  onClick?: (img: ImageItem) => void;
  showButton?: boolean;
  onButtonClick?: (img: ImageItem) => void;
  buttonText?: string;
  buttonColor?: string;
  buttonPosition?: "bottom" | "corner";
  captionColor?: string;            
  descriptionColor?: string;        
  textBackgroundColor?: string;     
  captionSize?: string;             
  descriptionSize?: string;         
}

const ImageGrid: React.FC<ImageGridProps> = ({
  images,
  shapeType = 1,
  columns,
  aspectRatio = "3/2",
  onClick,
  showButton = false,
  onButtonClick,
  buttonText = "Acción",
  buttonColor = "red",
  buttonPosition = "bottom",
  captionColor = "#1f2937",
  descriptionColor = "#6b7280",
  textBackgroundColor = "transparent",
  captionSize = "text-sm",
  descriptionSize = "text-sm",
}) => {
  const colClasses: Record<number, string> = {
    1: "grid-cols-1",
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-4",
    5: "sm:grid-cols-5",
    6: "sm:grid-cols-6",
  };

  const gridClass = `grid gap-6 ${
    columns && columns > 0
      ? colClasses[columns] ?? "sm:grid-cols-2"
      : shapeType === 3
      ? "grid-cols-1"
      : "sm:grid-cols-2"
  }`;

  return (
    <div className={gridClass}>
      {images.map((img, index) => (
        <div
          key={index}
          className="relative rounded-xl shadow-md hover:shadow-xl transition overflow-hidden"
        >
          {/* Imagen o componente */}
          {img.component ? (
            <div
              className="w-full cursor-pointer"
              onClick={() => onClick && onClick(img)}
            >
              {img.component}
            </div>
          ) : (
            img.src && (
              <div
                className="relative w-full"
                style={{ aspectRatio }}
              >
                <Image
                  src={img.src}
                  alt={img.caption ?? `image-${index}`}
                  fill
                  className="object-cover cursor-pointer"
                  onClick={() => onClick && onClick(img)}
                />
              </div>
            )
          )}

          {/* Botón en la esquina */}
          {showButton && buttonPosition === "corner" && (
            <button
              onClick={() => onButtonClick && onButtonClick(img)}
              className={`absolute top-2 right-2 bg-${buttonColor}-500 text-white px-3 py-1 rounded-full hover:bg-${buttonColor}-600 transition`}
              title={buttonText}
            >
              {buttonText}
            </button>
          )}

          {/* Bloque de texto: solo si hay contenido */}
          {(img.caption || img.description || (showButton && buttonPosition === "bottom")) && (
            <div
              className="p-3 flex flex-col items-center"
              style={{ backgroundColor: textBackgroundColor }}
            >
              {img.caption && (
                <p
                  className={`font-semibold text-center ${captionSize}`}
                  style={{ color: captionColor }}
                >
                  {img.caption}
                </p>
              )}
              {img.description && (
                <p
                  className={`text-center mt-1 ${descriptionSize}`}
                  style={{ color: descriptionColor }}
                >
                  {img.description}
                </p>
              )}

              {showButton && buttonPosition === "bottom" && (
                <button
                  onClick={() => onButtonClick && onButtonClick(img)}
                  className={`mt-3 px-4 py-2 bg-${buttonColor}-500 text-white rounded-lg hover:bg-${buttonColor}-600 transition`}
                >
                  {buttonText}
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ImageGrid;
