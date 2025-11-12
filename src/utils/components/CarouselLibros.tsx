'use client'

import React, { useState } from "react";
import  { ImageItem } from "@/src/utils/imagenes/ImageGrid";

interface CarouselProps {
  images: ImageItem[];
  itemsToShow?: number;
  aspectRatio?: string;
  onClick?: (img: ImageItem, index: number) => void;
  onPlay?: (img: ImageItem, index: number) => void;
  onAdd?: (img: ImageItem, index: number) => void;
  showIndicators?: boolean;
  showArrows?: boolean;
  gap?: string;
  className?: string;
}

export const CarouselLibros: React.FC<CarouselProps> = ({ 
  images,
  itemsToShow = 4,
  aspectRatio = "16/9",
  onClick,
  onPlay,
  onAdd,
  showIndicators = true,
  showArrows = true,
  gap = "gap-2",
  className = ""
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const maxIndex = Math.max(0, images.length - itemsToShow);
  
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

  const goToSlide = (index: number) => {
    setCurrentIndex(Math.min(index, maxIndex));
  };

  const shouldShowControls = images.length > itemsToShow;

  // Calcular el número de items según el viewport
  const getItemsPerView = () => {
    if (typeof window === 'undefined') return itemsToShow;
    const width = window.innerWidth;
    if (width < 640) return 2;
    if (width < 1024) return 3;
    return itemsToShow;
  };

  const [itemsPerView, setItemsPerView] = useState(getItemsPerView());

  React.useEffect(() => {
    const handleResize = () => {
      setItemsPerView(getItemsPerView());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`relative w-full ${className} py-4`}>
      {/* Botón anterior */}
      {showArrows && shouldShowControls && (
        <button
          onClick={prevSlide}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-2 md:p-3 rounded-r-lg z-20 transition-all duration-200 hover:scale-105"
          aria-label="Previous"
        >
          <svg className="w-4 h-4 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Contenedor del carrusel */}
      <div className={shouldShowControls ? "overflow-hidden px-8 md:px-12" : "overflow-visible"}>
        <div 
          className={`flex transition-transform duration-500 ease-in-out ${gap}`}
          style={{ 
            transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
          }}
        >
          {images.map((img, index) => (
            <div 
              key={index} 
             className="flex-shrink-0 px-1 py-4"
              style={{ 
                width: `calc(${100 / itemsPerView}% - 8px)`,
                transition: 'transform 0.3s ease-in-out'
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div 
                className={`relative rounded-lg overflow-hidden cursor-pointer group transition-all duration-300
                  ${hoveredIndex === index ? 'scale-110 z-30 shadow-2xl' : 'scale-100 shadow-md hover:shadow-lg'}
                `}
                style={{ aspectRatio }}
                onClick={() => onClick && onClick(img, index)}
              >
                {/* Imagen o Componente */}
                <div className="w-full h-full bg-gray-800">
                  {img.component ? (
                    // Renderizar componente personalizado si existe
                    <div className="w-full h-full">
                      {img.component}
                    </div>
                  ) : img.src ? (
                    // Manejar tanto string como StaticImageData
                    <img
                      src={typeof img.src === 'string' ? img.src : img.src.src}
                      alt={img.caption || img.description || `slide-${index}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    // Fallback cuando no hay imagen ni componente
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      No image
                    </div>
                  )}
                </div>
                
                {/* Overlay oscuro en hover */}
                <div className={`absolute inset-0 bg-black transition-opacity duration-300 ${
                  hoveredIndex === index ? 'opacity-40' : 'opacity-0'
                }`} />

                {/* Controles de hover (Play y Add) */}
                <div className={`absolute inset-0 flex items-center justify-center gap-3 transition-opacity duration-300 ${
                  hoveredIndex === index ? 'opacity-100' : 'opacity-0'
                }`}>
                  {/* Botón Play */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlay && onPlay(img, index);
                    }}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-all duration-200 hover:scale-110"
                    aria-label="Play"
                  >
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-900 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>

                  {/* Botón Add */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAdd && onAdd(img, index);
                    }}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white/90 hover:border-white hover:bg-white/20 flex items-center justify-center transition-all duration-200 hover:scale-110"
                    aria-label="Add to list"
                  >
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>

                {/* Categoría en la parte superior */}
                {img.caption && hoveredIndex === index && (
                  <div className="absolute top-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {img.caption}
                  </div>
                )}
                
                {/* Caption en la parte inferior */}
                {img.description && (
                  <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 md:p-3 transition-opacity duration-300 ${
                    hoveredIndex === index ? 'opacity-100' : 'opacity-0'
                  }`}>
                    <p className="text-white text-xs md:text-sm font-semibold">
                      {img.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Botón siguiente */}
      {showArrows && shouldShowControls && (
        <button
          onClick={nextSlide}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-2 md:p-3 rounded-l-lg z-20 transition-all duration-200 hover:scale-105"
          aria-label="Next"
        >
          <svg className="w-4 h-4 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Indicadores de puntos */}
      {showIndicators && shouldShowControls && (
        <div className="flex justify-center space-x-2 mt-4">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-200 ${
                currentIndex === index 
                  ? 'bg-white scale-125' 
                  : 'bg-gray-500 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CarouselLibros