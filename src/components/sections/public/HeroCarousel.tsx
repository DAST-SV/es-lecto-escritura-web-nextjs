"use client";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState, useMemo, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { HeroSlide } from "./type";
import { images } from "@/public/images";
import { NextImage } from "../../ui/NextImage";

// Imágenes del carrusel (usando la config centralizada)
const slideImages: string[] = [
  images.lectoescritura.v1,
  images.cuentos.v1,
  images.fabulas.v1,
  images.poemas.v1,
  images.leyendas.v1,
  images.dashboard.adivinanzasv1,
  images.historietas.v1,
  images.trabalenguas.v1,
  images.retahilas.v1, // Refranes o futuro
];

// Rutas asociadas a cada slide
const slideRoutes = [
  "/explorar",
  "/categoria/cuentos",
  "/categoria/fabulas",
  "/categoria/poemas",
  "/categoria/leyendas",
  "/categoria/adivinanzas",
  "/categoria/historietas",
  "/categoria/trabalenguas",
  "/categoria/refranes",
];

const HeroCarousel: React.FC = () => {
  const t = useTranslations("hero");
  const router = useRouter();
  const slides: HeroSlide[] = useMemo(() => t.raw("slides"), [t]);

  // Configuración optimizada para máximo rendimiento
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    skipSnaps: false,
    dragFree: false,
    duration: 25, // Más rápido
    startIndex: 0,
    containScroll: "trimSnaps",
    inViewThreshold: 0.7, // Optimización
  });

  const [selected, setSelected] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  
  // Referencias para evitar recreaciones
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Función optimizada para actualizar el slide seleccionado
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  // Configurar los event listeners de Embla (optimizado)
  useEffect(() => {
    if (!emblaApi) return;
    
    onSelect();
    emblaApi.on('select', onSelect);
    
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Auto-play optimizado
  useEffect(() => {
    const startAutoPlay = () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
      autoPlayRef.current = setInterval(() => {
        if (emblaApi && isPlaying && isVisible) {
          emblaApi.scrollNext();
        }
      }, 6000); // Reducido de 8000 a 6000 para más dinamismo
    };

    if (emblaApi && isPlaying && isVisible) {
      startAutoPlay();
    } else {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = null;
      }
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [emblaApi, isPlaying, isVisible]);

  // Detectar visibilidad (optimizado)
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange, { passive: true });

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Navegación optimizada
  const scrollPrev = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollNext();
  }, [emblaApi]);

  // ScrollTo ultra optimizado - navegación instantánea
  const scrollTo = useCallback((targetIndex: number) => {
    if (!emblaApi) return;
    
    const currentIndex = emblaApi.selectedScrollSnap();
    const slideCount = slides.length;
    
    if (currentIndex === targetIndex) return;
    
    // Navegación instantánea sin animación por pasos
    const forwardDistance = targetIndex > currentIndex 
      ? targetIndex - currentIndex 
      : slideCount - currentIndex + targetIndex;
    
    const backwardDistance = currentIndex > targetIndex 
      ? currentIndex - targetIndex 
      : currentIndex + slideCount - targetIndex;
    
    // Usar la dirección más corta con scrollTo directo
    if (forwardDistance <= backwardDistance) {
      // Si la distancia hacia adelante es corta, usar scrollTo directo
      if (forwardDistance <= 3) {
        emblaApi.scrollTo(targetIndex);
      } else {
        // Para distancias largas, usar scrollNext múltiple para mostrar el movimiento
        for (let i = 0; i < forwardDistance; i++) {
          setTimeout(() => emblaApi.scrollNext(), i * 25); // Más rápido: 25ms
        }
      }
    } else {
      if (backwardDistance <= 3) {
        emblaApi.scrollTo(targetIndex);
      } else {
        for (let i = 0; i < backwardDistance; i++) {
          setTimeout(() => emblaApi.scrollPrev(), i * 25); // Más rápido: 25ms
        }
      }
    }
  }, [emblaApi, slides.length]);

  // Pausa inteligente con timeout
  const handlePause = useCallback(() => {
    setIsPlaying(false);
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    pauseTimeoutRef.current = setTimeout(() => {
      setIsPlaying(true);
    }, 3000); // Resume después de 3 segundos
  }, []);

  const handleResume = useCallback(() => {
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    setIsPlaying(true);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    };
  }, []);

  return (
    <div
      className="relative h-[calc(100vh-56px)] overflow-hidden will-change-transform"
      onMouseEnter={handlePause}
      onMouseLeave={handleResume}
      onTouchStart={handlePause}
      onTouchEnd={handleResume}
    >
      {/* Fondo optimizado */}
      <div
        ref={emblaRef}
        className="embla h-full bg-cover bg-center bg-fixed"
        style={{ 
          backgroundImage: `url(${images.dashboard.fondov1})`,
          transform: 'translate3d(0,0,0)', // Force GPU acceleration
        }}
      >
        <div className="embla__container flex h-full">
          {slides.map((slide: HeroSlide, i: number) => (
            <div key={i} className="embla__slide w-full flex-shrink-0 h-full will-change-transform">
              <div className="w-full flex items-center px-6 md:px-16 py-10">
                {/* Desktop */}
                <div className="hidden md:flex w-full h-full items-center max-w-7xl mx-auto">
                  {/* Texto */}
                  <div className="w-1/2 pr-12 text-slate-800 flex flex-col justify-center ml-8 lg:ml-16">
                    <div className="flex items-center mb-6">
                      <span className="text-6xl mr-6 drop-shadow-lg select-none">{slide.icon}</span>
                      <h2 className="text-4xl lg:text-5xl font-black leading-tight text-slate-900 drop-shadow-sm select-none">
                        {slide.title}
                      </h2>
                    </div>
                    <p className="text-xl leading-relaxed font-medium mb-8 text-slate-700 bg-white/20 backdrop-blur-sm p-4 rounded-lg border-l-4 border-slate-800 select-none">
                      "{slide.description}"
                    </p>
                    <button
                      onClick={() => router.push(slideRoutes[i])}
                      className="bg-gradient-to-r from-slate-800 to-slate-900 text-white font-bold px-8 py-4 rounded-xl shadow-2xl hover:from-slate-700 hover:to-slate-800 transition-all duration-200 transform hover:scale-105 active:scale-95 w-fit text-lg border-2 border-slate-600 hover:border-slate-500 will-change-transform"
                    >
                      {slide.button}
                    </button>
                  </div>

                  {/* Imagen */}
                  <div className="w-1/2 flex justify-center items-center pr-8 lg:pr-16">
                    <NextImage
                      src={slideImages[i]}
                      alt={slide.title}
                      width={500}
                      height={500}
                      className="rounded-2xl object-fill max-h-[70vh] shadow-2xl will-change-transform"
                      priority={i <= 2} // Solo las primeras 3 imágenes priority
                      quality={85} // Reducir calidad para mejor rendimiento
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                    />
                  </div>
                </div>

                {/* Mobile */}
                <div className="md:hidden w-full h-full flex flex-col justify-center items-center text-slate-800 text-center px-4">
                  <div className="flex items-center justify-center mb-6">
                    <span className="text-5xl mr-4 drop-shadow-lg select-none">{slide.icon}</span>
                    <h2 className="text-3xl font-black text-slate-900 drop-shadow-sm select-none">
                      {slide.title}
                    </h2>
                  </div>
                  <div className="mb-6">
                    <NextImage
                      src={slideImages[i]}
                      alt={slide.title}
                      width={320}
                      height={320}
                      className="rounded-xl object-fill shadow-2xl will-change-transform"
                      priority={i <= 2}
                      quality={80}
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                    />
                  </div>
                  <p className="text-base leading-relaxed font-medium mb-6 max-w-md text-slate-700 bg-white/20 backdrop-blur-sm p-4 rounded-lg select-none">
                    "{slide.description}"
                  </p>
                  <button
                    onClick={() => router.push(slideRoutes[i])}
                    className="bg-gradient-to-r from-slate-800 to-slate-900 text-white font-bold px-6 py-3 rounded-lg shadow-2xl border-2 border-slate-600 transition-all duration-200 transform active:scale-95 will-change-transform"
                  >
                    {slide.button}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controles optimizados */}
      <button
        onClick={scrollPrev}
        className="absolute left-6 lg:left-8 top-1/2 -translate-y-1/2 bg-slate-800/80 hover:bg-slate-700/90 p-3 rounded-full transition-all duration-200 z-20 backdrop-blur-sm shadow-xl border-2 border-slate-600 hover:scale-110 active:scale-95 will-change-transform"
        aria-label="Anterior slide"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>

      <button
        onClick={scrollNext}
        className="absolute right-6 lg:right-8 top-1/2 -translate-y-1/2 bg-slate-800/80 hover:bg-slate-700/90 p-3 rounded-full transition-all duration-200 z-20 backdrop-blur-sm shadow-xl border-2 border-slate-600 hover:scale-110 active:scale-95 will-change-transform"
        aria-label="Siguiente slide"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Dots optimizados */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {slides.map((_, i: number) => (
          <button
            key={i}
            onClick={() => {
              scrollTo(i);
              handlePause();
            }}
            className={`w-4 h-4 rounded-full transition-all duration-200 border-2 will-change-transform ${selected === i
              ? "bg-slate-800 border-slate-600 scale-125 shadow-lg"
              : "bg-white/70 border-slate-800/50 hover:bg-white hover:border-slate-600 hover:scale-110 active:scale-95"
              }`}
            aria-label={`Ir al slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Estilos globales optimizados */}
      <style jsx global>{`
        .embla {
          overflow: hidden;
          transform: translate3d(0,0,0);
        }
        .embla__container {
          display: flex;
          backface-visibility: hidden;
          transition-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
          will-change: transform;
        }
        .embla__slide {
          flex: 0 0 100%;
          min-width: 0;
          transform: translate3d(0,0,0);
        }
        .embla__slide > div {
          transition: opacity 0.4s ease-out, transform 0.4s ease-out;
          will-change: opacity, transform;
        }
        button {
          transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          will-change: transform;
        }
        /* Optimizaciones de rendimiento */
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        .will-change-transform {
          will-change: transform;
        }
      `}</style>
    </div>
  );
};

export default HeroCarousel;