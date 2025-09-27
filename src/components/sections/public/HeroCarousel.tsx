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
      className="relative h-[calc(100vh-56px)] min-h-[450px] sm:min-h-[500px] md:min-h-[600px] lg:min-h-[650px] xl:min-h-[700px] max-h-[900px] overflow-hidden will-change-transform"
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
              
              {/* Container principal con padding adaptativo */}
              <div className="w-full h-full flex items-center justify-center px-3 py-3 xs:px-4 xs:py-4 sm:px-6 sm:py-5 md:px-8 md:py-6 lg:px-12 lg:py-8 xl:px-16 xl:py-10">
                
                {/* Layout DESKTOP - Pantallas grandes (1280px+) */}
                <div className="hidden xl:flex w-full h-full items-center justify-between max-w-7xl mx-auto gap-12">
                  {/* Contenido de texto - Desktop */}
                  <div className="w-[45%] text-slate-800 flex flex-col justify-center space-y-6">
                    <div className="flex items-center space-x-6">
                      <span className="text-6xl 2xl:text-7xl drop-shadow-lg select-none flex-shrink-0">{slide.icon}</span>
                      <h2 className="text-4xl 2xl:text-5xl font-black leading-tight text-slate-900 drop-shadow-sm select-none">
                        {slide.title}
                      </h2>
                    </div>
                    <p className="text-xl 2xl:text-2xl leading-relaxed font-medium text-slate-700 bg-white/20 backdrop-blur-sm p-5 2xl:p-6 rounded-lg border-l-4 border-slate-800 select-none shadow-lg">
                      "{slide.description}"
                    </p>
                    <button
                      onClick={() => router.push(slideRoutes[i])}
                      className="bg-gradient-to-r from-slate-800 to-slate-900 text-white font-bold px-8 py-4 2xl:px-10 2xl:py-5 rounded-xl shadow-2xl hover:from-slate-700 hover:to-slate-800 transition-all duration-200 transform hover:scale-105 active:scale-95 w-fit text-lg 2xl:text-xl border-2 border-slate-600 hover:border-slate-500 will-change-transform"
                    >
                      {slide.button}
                    </button>
                  </div>
                  {/* Imagen - Desktop */}
                  <div className="w-[50%] flex justify-center items-center">
                    <NextImage
                      src={slideImages[i]}
                      alt={slide.title}
                      width={600}
                      height={600}
                      className="rounded-2xl object-fill max-h-[65vh] 2xl:max-h-[70vh] shadow-2xl will-change-transform"
                      priority={i <= 2}
                      quality={90}
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                    />
                  </div>
                </div>

                {/* Layout LAPTOP - Pantallas medianas-grandes (1024-1279px) */}
                <div className="hidden lg:flex xl:hidden w-full h-full items-center justify-between max-w-6xl mx-auto gap-8">
                  {/* Contenido de texto - Laptop */}
                  <div className="w-[48%] text-slate-800 flex flex-col justify-center space-y-5">
                    <div className="flex items-center space-x-4">
                      <span className="text-5xl drop-shadow-lg select-none flex-shrink-0">{slide.icon}</span>
                      <h2 className="text-3xl font-black leading-tight text-slate-900 drop-shadow-sm select-none">
                        {slide.title}
                      </h2>
                    </div>
                    <p className="text-lg leading-relaxed font-medium text-slate-700 bg-white/20 backdrop-blur-sm p-4 rounded-lg border-l-4 border-slate-800 select-none shadow-lg">
                      "{slide.description}"
                    </p>
                    <button
                      onClick={() => router.push(slideRoutes[i])}
                      className="bg-gradient-to-r from-slate-800 to-slate-900 text-white font-bold px-7 py-3 rounded-xl shadow-2xl hover:from-slate-700 hover:to-slate-800 transition-all duration-200 transform hover:scale-105 active:scale-95 w-fit text-base border-2 border-slate-600 hover:border-slate-500 will-change-transform"
                    >
                      {slide.button}
                    </button>
                  </div>
                  {/* Imagen - Laptop */}
                  <div className="w-[48%] flex justify-center items-center">
                    <NextImage
                      src={slideImages[i]}
                      alt={slide.title}
                      width={450}
                      height={450}
                      className="rounded-2xl object-fill max-h-[55vh] shadow-2xl will-change-transform"
                      priority={i <= 2}
                      quality={85}
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                    />
                  </div>
                </div>

                {/* Layout TABLET HORIZONTAL - (768-1023px) */}
                <div className="hidden md:flex lg:hidden w-full h-full flex-col justify-center items-center text-slate-800 text-center max-w-4xl mx-auto space-y-4">
                  <div className="flex items-center justify-center space-x-4">
                    <span className="text-5xl drop-shadow-lg select-none">{slide.icon}</span>
                    <h2 className="text-3xl font-black text-slate-900 drop-shadow-sm select-none">
                      {slide.title}
                    </h2>
                  </div>
                  <div className="flex-shrink-0">
                    <NextImage
                      src={slideImages[i]}
                      alt={slide.title}
                      width={380}
                      height={380}
                      className="rounded-xl object-fill shadow-2xl will-change-transform max-h-[35vh]"
                      priority={i <= 2}
                      quality={80}
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                    />
                  </div>
                  <p className="text-lg leading-relaxed font-medium max-w-2xl text-slate-700 bg-white/20 backdrop-blur-sm p-4 rounded-lg select-none shadow-lg">
                    "{slide.description}"
                  </p>
                  <button
                    onClick={() => router.push(slideRoutes[i])}
                    className="bg-gradient-to-r from-slate-800 to-slate-900 text-white font-bold px-8 py-4 rounded-lg shadow-2xl border-2 border-slate-600 transition-all duration-200 transform active:scale-95 will-change-transform text-lg"
                  >
                    {slide.button}
                  </button>
                </div>

                {/* Layout TABLET VERTICAL y MÓVIL GRANDE - (640-767px) */}
                <div className="hidden sm:flex md:hidden w-full h-full flex-col justify-center items-center text-slate-800 text-center space-y-4 max-w-md mx-auto">
                  <div className="flex items-center justify-center space-x-3">
                    <span className="text-5xl drop-shadow-lg select-none">{slide.icon}</span>
                    <h2 className="text-2xl font-black text-slate-900 drop-shadow-sm select-none">
                      {slide.title}
                    </h2>
                  </div>
                  <div className="flex-shrink-0">
                    <NextImage
                      src={slideImages[i]}
                      alt={slide.title}
                      width={300}
                      height={300}
                      className="rounded-xl object-fill shadow-2xl will-change-transform max-h-[30vh]"
                      priority={i <= 2}
                      quality={75}
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                    />
                  </div>
                  <p className="text-base leading-relaxed font-medium text-slate-700 bg-white/20 backdrop-blur-sm p-4 rounded-lg select-none shadow-lg max-w-sm">
                    "{slide.description}"
                  </p>
                  <button
                    onClick={() => router.push(slideRoutes[i])}
                    className="bg-gradient-to-r from-slate-800 to-slate-900 text-white font-bold px-6 py-3 rounded-lg shadow-2xl border-2 border-slate-600 transition-all duration-200 transform active:scale-95 will-change-transform text-base w-full max-w-sm"
                  >
                    {slide.button}
                  </button>
                </div>

                {/* Layout MÓVIL - Pantallas pequeñas (menos de 640px) */}
                <div className="flex sm:hidden w-full h-full flex-col justify-center items-center text-slate-800 text-center space-y-3 max-w-xs mx-auto">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <span className="text-4xl drop-shadow-lg select-none">{slide.icon}</span>
                    <h2 className="text-xl font-black text-slate-900 drop-shadow-sm select-none text-center leading-tight">
                      {slide.title}
                    </h2>
                  </div>
                  <div className="flex-shrink-0">
                    <NextImage
                      src={slideImages[i]}
                      alt={slide.title}
                      width={240}
                      height={240}
                      className="rounded-lg object-fill shadow-2xl will-change-transform max-h-[25vh]"
                      priority={i <= 2}
                      quality={70}
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                    />
                  </div>
                  <p className="text-sm leading-relaxed font-medium text-slate-700 bg-white/20 backdrop-blur-sm p-3 rounded-lg select-none shadow-lg">
                    "{slide.description}"
                  </p>
                  <button
                    onClick={() => router.push(slideRoutes[i])}
                    className="bg-gradient-to-r from-slate-800 to-slate-900 text-white font-bold px-4 py-2 rounded-lg shadow-2xl border-2 border-slate-600 transition-all duration-200 transform active:scale-95 will-change-transform text-sm w-full max-w-[280px]"
                  >
                    {slide.button}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controles optimizados - Ultra responsivos */}
      <button
        onClick={scrollPrev}
        className="absolute left-1 xs:left-2 sm:left-3 md:left-4 lg:left-6 xl:left-8 top-1/2 -translate-y-1/2 bg-slate-800/90 hover:bg-slate-700/95 p-1.5 xs:p-2 sm:p-2.5 md:p-3 rounded-full transition-all duration-200 z-20 backdrop-blur-sm shadow-xl border border-slate-600 hover:scale-110 active:scale-95 will-change-transform"
        aria-label="Anterior slide"
      >
        <ChevronLeft className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white" />
      </button>

      <button
        onClick={scrollNext}
        className="absolute right-1 xs:right-2 sm:right-3 md:right-4 lg:right-6 xl:right-8 top-1/2 -translate-y-1/2 bg-slate-800/90 hover:bg-slate-700/95 p-1.5 xs:p-2 sm:p-2.5 md:p-3 rounded-full transition-all duration-200 z-20 backdrop-blur-sm shadow-xl border border-slate-600 hover:scale-110 active:scale-95 will-change-transform"
        aria-label="Siguiente slide"
      >
        <ChevronRight className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white" />
      </button>

      {/* Dots ultra responsivos con posicionamiento perfecto */}
      <div className="absolute bottom-2 xs:bottom-3 sm:bottom-4 md:bottom-5 lg:bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 xs:gap-2 sm:gap-2.5 md:gap-3 z-20">
        {slides.map((_, i: number) => (
          <button
            key={i}
            onClick={() => {
              scrollTo(i);
              handlePause();
            }}
            className={`w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 rounded-full transition-all duration-200 border will-change-transform ${selected === i
              ? "bg-slate-800 border-slate-600 scale-125 shadow-lg"
              : "bg-white/70 border-slate-800/50 hover:bg-white hover:border-slate-600 hover:scale-110 active:scale-95"
              }`}
            aria-label={`Ir al slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Estilos globales ultra-optimizados para máxima responsividad */}
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
        
        /* Breakpoint personalizado xs para móviles muy pequeños */
        @media (min-width: 475px) {
          .xs\\:px-4 { padding-left: 1rem; padding-right: 1rem; }
          .xs\\:py-4 { padding-top: 1rem; padding-bottom: 1rem; }
          .xs\\:left-2 { left: 0.5rem; }
          .xs\\:right-2 { right: 0.5rem; }
          .xs\\:bottom-3 { bottom: 0.75rem; }
          .xs\\:gap-2 { gap: 0.5rem; }
          .xs\\:w-2\\.5 { width: 0.625rem; }
          .xs\\:h-2\\.5 { height: 0.625rem; }
          .xs\\:w-4 { width: 1rem; }
          .xs\\:h-4 { height: 1rem; }
          .xs\\:p-2 { padding: 0.5rem; }
        }
        
        /* Mejoras específicas por rango de pantalla */
        @media (max-width: 374px) {
          .embla__slide h2 {
            font-size: 1.125rem !important;
            line-height: 1.3 !important;
          }
          .embla__slide p {
            font-size: 0.75rem !important;
            padding: 0.5rem !important;
          }
          .embla__slide button {
            font-size: 0.75rem !important;
            padding: 0.5rem 1rem !important;
          }
        }
        
        @media (min-width: 375px) and (max-width: 639px) {
          .embla__slide {
            padding: 0.5rem;
          }
        }
        
        @media (min-width: 640px) and (max-width: 767px) {
          .embla__slide {
            padding: 1rem;
          }
        }
        
        @media (min-width: 768px) and (max-width: 1023px) {
          .embla__slide {
            padding: 1.5rem;
          }
        }
        
        @media (min-width: 1024px) and (max-width: 1279px) {
          .embla__slide {
            padding: 2rem;
          }
        }
        
        @media (min-width: 1280px) {
          .embla__slide {
            padding: 2.5rem;
          }
        }
        
        /* Optimización para pantallas con altura reducida */
        @media (max-height: 500px) {
          .embla__slide h2 {
            font-size: 1.25rem !important;
            margin-bottom: 0.5rem !important;
          }
          .embla__slide p {
            font-size: 0.875rem !important;
            margin-bottom: 1rem !important;
            padding: 0.5rem !important;
          }
          .embla__slide button {
            padding: 0.5rem 1rem !important;
            font-size: 0.875rem !important;
          }
        }
        
        /* Optimización para pantallas ultra anchas */
        @media (min-width: 1920px) {
          .embla__slide h2 {
            font-size: 4rem !important;
          }
          .embla__slide p {
            font-size: 1.5rem !important;
          }
          .embla__slide button {
            font-size: 1.25rem !important;
            padding: 1.25rem 2rem !important;
          }
        }
        
        /* Mejoras para orientación landscape en móviles */
        @media (max-height: 500px) and (orientation: landscape) {
          .embla__slide {
            padding: 0.5rem !important;
          }
          .embla__slide > div {
            max-height: 90vh;
            overflow: hidden;
          }
          .embla__slide img {
            max-height: 30vh !important;
          }
        }
        
        /* Hover states solo en dispositivos que los soporten */
        @media (hover: hover) and (pointer: fine) {
          button:hover {
            transform: scale(1.05);
          }
        }
        
        /* Reduce motion para usuarios que lo prefieran */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
};

export default HeroCarousel;