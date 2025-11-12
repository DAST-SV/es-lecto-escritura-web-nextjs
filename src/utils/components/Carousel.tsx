'use client'

import React, { useState } from "react";
import Image from "next/image";
import { ImageItem } from "@/src/utils/imagenes/ImageGrid";

interface CarouselProps {
  images: ImageItem[];
  itemsToShow?: number;
  aspectRatio?: string;
  onClick?: (img: ImageItem, index: number) => void;
  showIndicators?: boolean;
  showArrows?: boolean;
  gap?: string;
  className?: string;
}

const Carousel: React.FC<CarouselProps> = ({ 
  images,
  itemsToShow = 3,
  aspectRatio = "3/4",
  onClick,
  showIndicators = true,
  showArrows = true,
  gap = "gap-4",
  className = ""
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // 🔹 Calcular límites correctos
  const maxIndex = Math.max(0, images.length - itemsToShow);
  
  // 🔹 Navegación del carrusel
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex >= maxIndex ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex <= 0 ? maxIndex : prevIndex - 1
    );
  };

  // 🔹 Ir a slide específico
  const goToSlide = (index: number) => {
    setCurrentIndex(Math.min(index, maxIndex));
  };

  // 🔹 Si no hay suficientes imágenes, no mostrar controles
  const shouldShowControls = images.length > itemsToShow;

  return (
    <div className={`relative w-full ${className} py-4`}>
      {/* 🔹 Botón anterior */}
      {showArrows && shouldShowControls && (
        <button
          onClick={prevSlide}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full z-10 transition-all duration-200 hover:scale-110"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* 🔹 Contenedor del carrusel */}
     <div className={shouldShowControls ? "overflow-hidden px-8 md:px-12" : "overflow-visible"}>
        <div 
          className={`flex transition-transform duration-500 ease-in-out ${gap}`}
          style={{ 
            transform: `translateX(-${currentIndex * (100 / itemsToShow)}%)`,
          }}
        >
          {images.map((img, index) => (
            <div 
              key={index} 
              className="flex-shrink-0 px-1 py-4"
              style={{ width: `calc(${100 / itemsToShow}% - ${gap === 'gap-4' ? '12px' : gap === 'gap-6' ? '18px' : '6px'})` }}
            >
              <div 
                className={`relative rounded-xl shadow-md hover:shadow-xl transition-all duration-200 hover:scale-105 cursor-pointer overflow-hidden`}
                style={{ aspectRatio }}
                onClick={() => onClick && onClick(img, index)}
              >
                {img.src && (
                  <Image
                    src={img.src}
                    alt={img.caption || `slide-${index}`}
                    fill
                    className="object-cover"
                  />
                )}
                
                {/* 🔹 Caption si existe */}
                {img.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                    <p className="text-white text-sm font-semibold text-center">
                      {img.caption}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🔹 Botón siguiente */}
      {showArrows && shouldShowControls && (
        <button
          onClick={nextSlide}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full z-10 transition-all duration-200 hover:scale-110"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* 🔹 Indicadores de puntos */}
      {showIndicators && shouldShowControls && (
        <div className="flex justify-center space-x-2 mt-4">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                currentIndex === index 
                  ? 'bg-blue-600 scale-125' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Carousel;