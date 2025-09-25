import React from "react";
import Image, { StaticImageData } from "next/image";

export interface ImageItem {
  src?: string | StaticImageData;
  component?: React.ReactNode;
  caption: string;
  description?: string;
  Json?: string;
}

interface ImageGridProps {
  images: ImageItem[];
  shapeType?: number;
  columns?: number;
  onClick?: (img: ImageItem) => void;
  showButton?: boolean;
  onButtonClick?: (img: ImageItem) => void;
  buttonText?: string;
  buttonColor?: string;
  buttonPosition?: "bottom" | "corner";
  captionColor?: string;            // color del caption
  descriptionColor?: string;        // color de description
  textBackgroundColor?: string;     // color de fondo del div de texto
  captionSize?: string;             // tamaño del caption
  descriptionSize?: string;         // tamaño del description
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
    4: "sm:grid-cols-4",
  };

  const gridClass = `grid gap-6 ${
    columns && columns > 0
      ? colClasses[columns]
      : shapeType === 3
      ? "grid-cols-1"
      : "sm:grid-cols-2"
  }`;

  return (
    <div className={gridClass}>
      {images.map((img, index) => (
        <div
          key={index}
          className="relative flex flex-col items-center bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden"
        >
          {img.component ? (
            <div
              className="w-full cursor-pointer"
              onClick={() => onClick && onClick(img)}
            >
              {img.component}
            </div>
          ) : (
            img.src && (
              <Image
                src={img.src}
                alt={img.caption}
                width={500}
                height={300}
                className={`w-full object-cover cursor-pointer ${
                  shapeType === 2 ? "aspect-square" : "h-auto"
                }`}
                onClick={() => onClick && onClick(img)}
              />
            )
          )}

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
          <div
            className="p-3 w-full flex flex-col items-center"
            style={{ backgroundColor: textBackgroundColor }}
          >
            <p
              className={`font-semibold text-center ${captionSize}`}
              style={{ color: captionColor }}
            >
              {img.caption}
            </p>
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
        </div>
      ))}
    </div>
  );
};


export default ImageGrid;
