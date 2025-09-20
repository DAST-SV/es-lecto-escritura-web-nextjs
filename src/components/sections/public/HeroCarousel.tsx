"use client";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Image, { StaticImageData } from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { 
  eslectoescriturav1, 
  cuentosv1, 
  fabulasv1, 
  poemasv1, 
  leyendasv1, 
  adivinanzasv1, 
  historietasv1, 
  trabalenguasv1 
} from "@/public/images";
import type { HeroSlide } from "./type";

const slideImages: StaticImageData[] = [
  eslectoescriturav1,
  cuentosv1,
  fabulasv1,
  poemasv1,
  leyendasv1,
  adivinanzasv1,
  historietasv1,
  trabalenguasv1,
  trabalenguasv1, // Para refranes
];

// Mapeo de slides a rutas de categorías
const slideRoutes = [
  '/explorar', // ESLectoescritura general
  '/categoria/cuentos',
  '/categoria/fabulas', 
  '/categoria/poemas',
  '/categoria/leyendas',
  '/categoria/adivinanzas',
  '/categoria/historietas',
  '/categoria/trabalenguas',
  '/categoria/refranes'
];

const HeroCarousel: React.FC = () => {
  const t = useTranslations('hero');
  const router = useRouter();
  const slides: HeroSlide[] = t.raw('slides');
  
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    skipSnaps: false,
    dragFree: false,
    duration: 35, // Transición más suave (más lenta)
    startIndex: 0,
    containScroll: 'trimSnaps'
  });
  const [selected, setSelected] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  // Auto-play functionality con control de estado
  useEffect(() => {
    if (!emblaApi || !isPlaying || !isVisible) return;

    const autoPlay = setInterval(() => {
      emblaApi.scrollNext();
    }, 8000); // Aumentado a 8 segundos

    return () => clearInterval(autoPlay);
  }, [emblaApi, isPlaying, isVisible]);

  // Detectar visibilidad de la página (focus/blur)
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    const handleFocus = () => setIsVisible(true);
    const handleBlur = () => setIsVisible(false);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((i: number) => emblaApi && emblaApi.scrollTo(i), [emblaApi]);

  return (
    <div 
      className="relative h-[calc(100vh-56px)] overflow-hidden"
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
    >
      <div className={`bg-[url('/images/a076a7e2c35970e29ff54ba0759f8ae275ffd8fda1fa6a500879f473aef9896b.webp')] bg-cover bg-center embla h-full`} ref={emblaRef}>
        <div className="embla__container flex h-full">
          {slides.map((slide: HeroSlide, i: number) => (
            <div
              key={i}
              className="embla__slide w-full flex-shrink-0 h-full"
            >
              <div className="w-full flex items-center px-6 md:px-16 py-10">
                {/* Contenido Desktop */}
                <div className="hidden md:flex w-full h-full items-center max-w-7xl mx-auto">
                  {/* Texto */}
                  <div className="w-1/2 pr-12 text-slate-800 flex flex-col justify-center ml-8 lg:ml-16">
                    <div className="flex items-center mb-6">
                      <span className="text-6xl mr-6 drop-shadow-lg">{slide.icon}</span>
                      <h2 className="text-4xl lg:text-5xl font-black leading-tight text-slate-900 drop-shadow-sm">
                        {slide.title}
                      </h2>
                    </div>
                    <p className="text-xl leading-relaxed font-medium mb-8 text-slate-700 bg-white/20 backdrop-blur-sm p-4 rounded-lg border-l-4 border-slate-800">
                      "{slide.description}"
                    </p>
                    <button 
                      onClick={() => router.push(slideRoutes[i])}
                      className="bg-gradient-to-r from-slate-800 to-slate-900 text-white font-bold px-8 py-4 rounded-xl shadow-2xl hover:from-slate-700 hover:to-slate-800 transition-all duration-300 transform hover:scale-105 w-fit text-lg border-2 border-slate-600 hover:border-slate-500"
                    >
                      {slide.button}
                    </button>
                  </div>

                  {/* Imagen */}
                  <div className="w-1/2 flex justify-center items-center pr-8 lg:pr-16">
                    <div className="relative">
                      <Image
                        src={slideImages[i]}
                        alt={slide.title}
                        width={500}
                        height={500}
                        className="rounded-2xl object-fill max-h-[70vh] shadow-2xl"
                        priority={i === 0}
                      />
                    </div>
                  </div>
                </div>

                {/* Contenido Mobile */}
                <div className="md:hidden w-full h-full flex flex-col justify-center items-center text-slate-800 text-center px-4">
                  <div className="flex items-center justify-center mb-6">
                    <span className="text-5xl mr-4 drop-shadow-lg">{slide.icon}</span>
                    <h2 className="text-3xl font-black text-slate-900 drop-shadow-sm">
                      {slide.title}
                    </h2>
                  </div>

                  <div className="mb-6">
                    <Image
                      src={slideImages[i]}
                      alt={slide.title}
                      width={320}
                      height={320}
                      className="rounded-xl object-fill shadow-2xl"
                      priority={i === 0}
                    />
                  </div>

                  <p className="text-base leading-relaxed font-medium mb-6 max-w-md text-slate-700 bg-white/20 backdrop-blur-sm p-4 rounded-lg">
                    "{slide.description}"
                  </p>

                  <button 
                    onClick={() => router.push(slideRoutes[i])}
                    className="bg-gradient-to-r from-slate-800 to-slate-900 text-white font-bold px-6 py-3 rounded-lg shadow-2xl border-2 border-slate-600"
                  >
                    {slide.button}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controles del carousel */}
      <button
        onClick={scrollPrev}
        onMouseEnter={() => setIsPlaying(false)}
        onMouseLeave={() => setIsPlaying(true)}
        className="absolute left-6 lg:left-8 top-1/2 -translate-y-1/2 bg-slate-800/80 hover:bg-slate-700/90 p-3 rounded-full transition-all duration-300 z-20 backdrop-blur-sm shadow-xl border-2 border-slate-600 hover:scale-110"
        aria-label="Anterior slide"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>

      <button
        onClick={scrollNext}
        onMouseEnter={() => setIsPlaying(false)}
        onMouseLeave={() => setIsPlaying(true)}
        className="absolute right-6 lg:right-8 top-1/2 -translate-y-1/2 bg-slate-800/80 hover:bg-slate-700/90 p-3 rounded-full transition-all duration-300 z-20 backdrop-blur-sm shadow-xl border-2 border-slate-600 hover:scale-110"
        aria-label="Siguiente slide"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Dots */}
      <div 
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20"
        onMouseEnter={() => setIsPlaying(false)}
        onMouseLeave={() => setIsPlaying(true)}
      >
        {slides.map((_, i: number) => (
          <button
            key={i}
            onClick={() => {
              scrollTo(i);
              setIsPlaying(false); // Pausar cuando se hace clic en un dot
              setTimeout(() => setIsPlaying(true), 2000); // Reanudar después de 2 segundos
            }}
            className={`w-4 h-4 rounded-full transition-all duration-300 border-2 ${selected === i 
              ? "bg-slate-800 border-slate-600 scale-125 shadow-lg" 
              : "bg-white/70 border-slate-800/50 hover:bg-white hover:border-slate-600"
            }`}
            aria-label={`Ir al slide ${i + 1}`}
          />
        ))}
      </div>

      <style jsx global>{`
        .embla {
          overflow: hidden;
        }
        .embla__container {
          display: flex;
          transition-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .embla__slide {
          flex: 0 0 100%;
          min-width: 0;
        }
        
        /* Animación más suave para el contenido */
        .embla__slide > div {
          transition: opacity 0.6s ease-in-out, transform 0.6s ease-in-out;
        }
        
        /* Mejores transiciones para los botones */
        button {
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
      `}</style>
    </div>
  );
};

export default HeroCarousel;