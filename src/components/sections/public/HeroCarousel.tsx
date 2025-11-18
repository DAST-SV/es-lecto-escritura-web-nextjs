"use client";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import {
  useCallback,
  useEffect,
  useState,
  useMemo,
  memo,
  useRef,
} from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Sparkles, BookOpen } from "lucide-react";
import type { HeroSlide } from "./type";
import { images } from "@/public/images";
import { NextImage } from "../../ui/NextImage";

const SLIDE_IMAGES = [
  images.lectoescritura.v1,
  images.cuentos.v1,
  images.fabulas.v1,
  images.poemas.v1,
  images.leyendas.v1,
  images.dashboard.adivinanzasv1,
  images.historietas.v1,
  images.trabalenguas.v1,
  images.retahilas.v1,
] as const;

const SLIDE_ROUTES = [
  "/explorar",
  "/categoria/cuentos",
  "/categoria/fabulas",
  "/categoria/poemas",
  "/categoria/leyendas",
  "/categoria/adivinanzas",
  "/categoria/historietas",
  "/categoria/trabalenguas",
  "/categoria/refranes",
] as const;

const AUTOPLAY_CONFIG = {
  delay: 6000,
  stopOnInteraction: true,
  stopOnMouseEnter: true,
  stopOnFocusIn: true,
} as const;

const EMBLA_CONFIG = {
  loop: true,
  duration: 30,
  skipSnaps: false,
  dragFree: false,
} as const;

const SlideContent = memo<{
  slide: HeroSlide;
  imageSrc: string;
  route: string;
  index: number;
  isActive: boolean;
  onNavigate: (route: string) => void;
}>(({ slide, imageSrc, route, index, isActive, onNavigate }) => {
  const isPriority = index === 0;

  return (
    <>
      {/* DESKTOP (1280px+) */}
      <div className="hidden xl:flex w-full max-w-5xl items-center justify-between gap-8 mx-auto">
        <div className="w-[50%] space-y-4 slide-content">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/95 backdrop-blur-md rounded-full shadow-2xl border-2 border-yellow-300">
            <BookOpen className="w-4 h-4 text-blue-600 animate-pulse" />
            <span className="text-sm font-black text-blue-700 tracking-wide" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
              EXPLORAR CONTENIDO
            </span>
          </div>

          <div className="space-y-2">
            <h1
              className="text-4xl font-black text-white leading-none drop-shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
              style={{
                fontFamily: 'Comic Sans MS, cursive',
                textShadow: '3px 3px 0px rgba(0,0,0,0.3), 6px 6px 0px rgba(0,0,0,0.1)'
              }}
            >
              {slide.title}
            </h1>

            <div className="flex items-center gap-3">
              <div className="h-1.5 w-16 bg-yellow-300 rounded-full" />
              <div className="h-1.5 w-10 bg-green-300 rounded-full" />
              <div className="h-1.5 w-6 bg-blue-300 rounded-full" />
            </div>
          </div>

          <p className="text-lg text-white font-bold leading-relaxed drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)] max-w-xl" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
            {slide.description}
          </p>

          <button
            onClick={() => onNavigate(route)}
            className="group relative px-8 py-3.5 bg-yellow-300 text-blue-700 font-black text-base rounded-full shadow-2xl hover:shadow-yellow-400/50 transition-all duration-300 hover:scale-110 border-2 border-white overflow-hidden"
            style={{ fontFamily: 'Comic Sans MS, cursive' }}
            type="button"
            tabIndex={isActive ? 0 : -1}
          >
            <span className="relative z-10 flex items-center gap-2">
              {slide.button}
              <Sparkles className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>

        <div className="w-[50%] flex justify-end items-end slide-image">
          <div className="relative z-20">
            <div className="absolute -inset-6 bg-gradient-to-r from-yellow-300 via-orange-300 to-yellow-300 rounded-full blur-3xl opacity-60 animate-pulse" />
            <div className="relative bg-white rounded-3xl p-3 shadow-2xl border-4 border-yellow-300 transform hover:rotate-2 transition-transform duration-500">
              <NextImage
                src={imageSrc}
                alt={slide.title}
                width={350}
                height={350}
                className="rounded-2xl object-cover w-full h-[320px]"
                priority={isPriority}
                quality={90}
                loading={isPriority ? "eager" : "lazy"}
                sizes="(min-width: 1280px) 350px, 0px"
              />
            </div>
          </div>
        </div>
      </div>

      {/* LAPTOP (1024-1279px) */}
      <div className="hidden lg:flex xl:hidden w-full max-w-4xl items-center justify-between gap-8 mx-auto">
        <div className="w-[50%] space-y-3 slide-content">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/95 backdrop-blur-md rounded-full shadow-2xl border-2 border-yellow-300">
            <BookOpen className="w-4 h-4 text-blue-600 animate-pulse" />
            <span className="text-sm font-black text-blue-700 tracking-wide" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
              EXPLORAR CONTENIDO
            </span>
          </div>

          <div className="space-y-2">
            <h1
              className="text-3xl font-black text-white leading-tight drop-shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
              style={{
                fontFamily: 'Comic Sans MS, cursive',
                textShadow: '3px 3px 0px rgba(0,0,0,0.3), 6px 6px 0px rgba(0,0,0,0.1)'
              }}
            >
              {slide.title}
            </h1>

            <div className="flex items-center gap-2">
              <div className="h-1.5 w-14 bg-yellow-300 rounded-full" />
              <div className="h-1.5 w-8 bg-green-300 rounded-full" />
              <div className="h-1.5 w-5 bg-blue-300 rounded-full" />
            </div>
          </div>

          <p className="text-base text-white font-bold leading-relaxed drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)] max-w-md" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
            {slide.description}
          </p>

          <button
            onClick={() => onNavigate(route)}
            className="group relative px-7 py-3 bg-yellow-300 text-blue-700 font-black text-base rounded-full shadow-2xl hover:shadow-yellow-400/50 transition-all duration-300 hover:scale-110 border-2 border-white overflow-hidden"
            style={{ fontFamily: 'Comic Sans MS, cursive' }}
            type="button"
            tabIndex={isActive ? 0 : -1}
          >
            <span className="relative z-10 flex items-center gap-2">
              {slide.button}
              <Sparkles className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>

        <div className="w-[50%] flex justify-end items-end slide-image">
          <div className="relative">
            <div className="absolute -inset-5 bg-gradient-to-r from-yellow-300 via-orange-300 to-yellow-300 rounded-full blur-3xl opacity-60 animate-pulse" />
            <div className="relative bg-white rounded-3xl p-3 shadow-2xl border-4 border-yellow-300 transform hover:rotate-2 transition-transform duration-500">
              <NextImage
                src={imageSrc}
                alt={slide.title}
                width={300}
                height={300}
                className="rounded-2xl object-cover w-full h-[280px]"
                priority={isPriority}
                quality={85}
                loading={isPriority ? "eager" : "lazy"}
                sizes="(min-width: 1024px) and (max-width: 1279px) 300px, 0px"
              />
              <div className="absolute -top-3 -right-3 bg-green-400 text-white font-black text-sm px-3 py-1.5 rounded-full shadow-xl border-2 border-white transform rotate-12 animate-bounce">
                🎉 NUEVO
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABLET (768-1023px) */}
      <div className="hidden md:flex lg:hidden w-full max-w-3xl flex-col items-center text-center space-y-4 mx-auto px-6">
        <div className="space-y-3 slide-content">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/95 backdrop-blur-md rounded-full shadow-2xl border-2 border-yellow-300">
            <BookOpen className="w-4 h-4 text-blue-600 animate-pulse" />
            <span className="text-sm font-black text-blue-700 tracking-wide" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
              EXPLORAR CONTENIDO
            </span>
          </div>

          <h1
            className="text-3xl font-black text-white leading-tight drop-shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
            style={{
              fontFamily: 'Comic Sans MS, cursive',
              textShadow: '3px 3px 0px rgba(0,0,0,0.3), 6px 6px 0px rgba(0,0,0,0.1)'
            }}
          >
            {slide.title}
          </h1>

          <div className="flex items-center gap-2 justify-center">
            <div className="h-1.5 w-12 bg-yellow-300 rounded-full" />
            <div className="h-1.5 w-8 bg-green-300 rounded-full" />
            <div className="h-1.5 w-5 bg-blue-300 rounded-full" />
          </div>
        </div>

        <div className="slide-image">
          <div className="relative inline-block">
            <div className="absolute -inset-4 bg-gradient-to-r from-yellow-300 via-orange-300 to-yellow-300 rounded-full blur-2xl opacity-60 animate-pulse" />
            <div className="relative bg-white rounded-3xl p-3 shadow-2xl border-4 border-yellow-300">
              <NextImage
                src={imageSrc}
                alt={slide.title}
                width={320}
                height={320}
                className="rounded-2xl object-cover h-[300px] w-[320px]"
                priority={isPriority}
                quality={80}
                loading={isPriority ? "eager" : "lazy"}
                sizes="(min-width: 768px) and (max-width: 1023px) 320px, 0px"
              />
            </div>
          </div>
        </div>

        <p className="text-base text-white font-bold leading-relaxed drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)] max-w-xl" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
          {slide.description}
        </p>

        <button
          onClick={() => onNavigate(route)}
          className="group relative px-7 py-3 bg-yellow-300 text-blue-700 font-black text-base rounded-full shadow-2xl hover:shadow-yellow-400/50 transition-all duration-300 hover:scale-105 border-2 border-white overflow-hidden"
          style={{ fontFamily: 'Comic Sans MS, cursive' }}
          type="button"
          tabIndex={isActive ? 0 : -1}
        >
          <span className="relative z-10 flex items-center gap-2">
            {slide.button}
            <Sparkles className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
      </div>

      {/* MOBILE (640-767px) */}
      <div className="hidden sm:flex md:hidden w-full max-w-md flex-col items-center text-center space-y-4 mx-auto px-4">
        <div className="space-y-2 slide-content">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-full shadow-xl border-2 border-yellow-300">
            <BookOpen className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            <span className="text-xs font-black text-blue-700 tracking-wide" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
              EXPLORAR CONTENIDO
            </span>
          </div>

          <h1
            className="text-2xl font-black text-white leading-tight drop-shadow-[0_6px_24px_rgba(0,0,0,0.5)]"
            style={{
              fontFamily: 'Comic Sans MS, cursive',
              textShadow: '2px 2px 0px rgba(0,0,0,0.3), 4px 4px 0px rgba(0,0,0,0.1)'
            }}
          >
            {slide.title}
          </h1>
        </div>

        <div className="slide-image">
          <div className="relative inline-block">
            <div className="absolute -inset-3 bg-gradient-to-r from-yellow-300 via-orange-300 to-yellow-300 rounded-full blur-xl opacity-60 animate-pulse" />
            <div className="relative bg-white rounded-2xl p-3 shadow-2xl border-2 border-yellow-300">
              <NextImage
                src={imageSrc}
                alt={slide.title}
                width={260}
                height={260}
                className="rounded-xl object-cover h-[240px] w-[260px]"
                priority={isPriority}
                quality={75}
                loading={isPriority ? "eager" : "lazy"}
                sizes="(min-width: 640px) and (max-width: 767px) 260px, 0px"
              />
            </div>
          </div>
        </div>

        <p className="text-sm text-white font-bold leading-relaxed drop-shadow-[0_3px_10px_rgba(0,0,0,0.4)]" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
          {slide.description}
        </p>

        <button
          onClick={() => onNavigate(route)}
          className="group relative w-full px-6 py-3 bg-yellow-300 text-blue-700 font-black text-sm rounded-full shadow-xl hover:shadow-yellow-400/50 transition-all duration-300 border-2 border-white overflow-hidden"
          style={{ fontFamily: 'Comic Sans MS, cursive' }}
          type="button"
          tabIndex={isActive ? 0 : -1}
        >
          <span className="relative z-10 flex items-center gap-2 justify-center">
            {slide.button}
            <Sparkles className="w-4 h-4" />
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
      </div>

      {/* MOBILE SMALL (<640px) */}
      <div className="flex sm:hidden w-full max-w-[300px] flex-col items-center text-center space-y-3 mx-auto px-4">
        <div className="space-y-2 slide-content">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-full shadow-lg border-2 border-yellow-300">
            <BookOpen className="w-3 h-3 text-blue-600 animate-pulse" />
            <span className="text-[10px] font-black text-blue-700 tracking-wide" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
              EXPLORAR
            </span>
          </div>

          <h1
            className="text-xl font-black text-white leading-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)]"
            style={{
              fontFamily: 'Comic Sans MS, cursive',
              textShadow: '2px 2px 0px rgba(0,0,0,0.3)'
            }}
          >
            {slide.title}
          </h1>
        </div>

        <div className="slide-image">
          <div className="relative bg-white rounded-2xl p-2 shadow-xl border-2 border-yellow-300">
            <NextImage
              src={imageSrc}
              alt={slide.title}
              width={220}
              height={220}
              className="rounded-xl object-cover h-[200px] w-[220px]"
              priority={isPriority}
              quality={70}
              loading={isPriority ? "eager" : "lazy"}
              sizes="(max-width: 639px) 220px, 0px"
            />
            <div className="absolute -top-2 -right-2 bg-green-400 text-white font-black text-[10px] px-2 py-1 rounded-full shadow-lg border-2 border-white transform rotate-12 animate-bounce">
              🎉
            </div>
          </div>
        </div>

        <p className="text-xs text-white font-bold leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
          {slide.description}
        </p>

        <button
          onClick={() => onNavigate(route)}
          className="w-full px-5 py-2.5 bg-yellow-300 text-blue-700 font-black text-sm rounded-xl shadow-lg border-2 border-white flex items-center gap-1.5 justify-center"
          style={{ fontFamily: 'Comic Sans MS, cursive' }}
          type="button"
          tabIndex={isActive ? 0 : -1}
        >
          {slide.button}
          <Sparkles className="w-3.5 h-3.5" />
        </button>
      </div>
    </>
  );
});

SlideContent.displayName = "SlideContent";

const HeroCarousel: React.FC = () => {
  const t = useTranslations("hero");
  const router = useRouter();
  const slides: HeroSlide[] = useMemo(() => t.raw("slides"), [t]);
  
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoplay = useMemo(() => Autoplay(AUTOPLAY_CONFIG), []);
  const [emblaRef, emblaApi] = useEmblaCarousel(EMBLA_CONFIG, [autoplay]);

  const [selected, setSelected] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!carouselRef.current || !emblaApi) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          emblaApi.emit("pointerDown" as any);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(carouselRef.current);
    return () => observer.disconnect();
  }, [emblaApi]);

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
    autoplay.reset();
  }, [emblaApi, autoplay]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
    autoplay.reset();
  }, [emblaApi, autoplay]);

  const scrollTo = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index);
      autoplay.reset();
    },
    [emblaApi, autoplay]
  );

  const handleNavigate = useCallback(
    (route: string) => {
      router.push(route);
    },
    [router]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        scrollPrev();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        scrollNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [scrollPrev, scrollNext]);

  useEffect(() => {
    if (!emblaApi) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        emblaApi.emit("pointerDown" as any);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [emblaApi]);

  return (
    <div
      ref={carouselRef}
      className="relative h-[calc(100vh-56px)] overflow-hidden"
      role="region"
      aria-label="Carrusel de contenido educativo"
      aria-live="polite"
    >
      <div ref={emblaRef} className="embla h-full relative z-10">
        <div className="embla__container flex h-full">
          {slides.map((slide: HeroSlide, i: number) => (
            <div
              key={i}
              className="embla__slide flex-[0_0_100%] min-w-0"
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} de ${slides.length}`}
            >
              <div className="w-full h-full flex items-start justify-center pt-8 pb-4 px-20 md:px-24 lg:px-32">
                <SlideContent
                  slide={slide}
                  imageSrc={SLIDE_IMAGES[i]}
                  route={SLIDE_ROUTES[i]}
                  index={i}
                  isActive={selected === i}
                  onNavigate={handleNavigate}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Botones de Navegación */}
      <button
        onClick={scrollPrev}
        className="absolute top-1/2 -translate-y-1/2 left-4 md:left-6 z-40 p-3 md:p-4 rounded-full bg-white shadow-2xl hover:scale-125 transition-all duration-300 border-2 border-yellow-300 hover:bg-yellow-50 group"
        aria-label="Slide anterior"
        type="button"
      >
        <ChevronLeft className="w-6 h-6 md:w-7 md:h-7 text-blue-700 group-hover:text-blue-900" strokeWidth={4} />
      </button>

      <button
        onClick={scrollNext}
        className="absolute top-1/2 -translate-y-1/2 right-4 md:right-6 z-40 p-3 md:p-4 rounded-full bg-white shadow-2xl hover:scale-125 transition-all duration-300 border-2 border-yellow-300 hover:bg-yellow-50 group"
        aria-label="Slide siguiente"
        type="button"
      >
        <ChevronRight className="w-6 h-6 md:w-7 md:h-7 text-blue-700 group-hover:text-blue-900" strokeWidth={4} />
      </button>

      {/* Indicadores con colores decorativos */}
      <nav
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur-md rounded-full shadow-2xl border-2 border-white px-6 py-3"
        aria-label="Navegación del carrusel"
      >
        <div className="flex items-center justify-center gap-2">
          {slides.map((_, i: number) => {
            const colors = ['bg-yellow-400', 'bg-green-400', 'bg-blue-400', 'bg-orange-400', 'bg-pink-400', 'bg-purple-400', 'bg-cyan-400', 'bg-lime-400', 'bg-rose-400'];
            const borderColors = ['border-yellow-600', 'border-green-600', 'border-blue-600', 'border-orange-600', 'border-pink-600', 'border-purple-600', 'border-cyan-600', 'border-lime-600', 'border-rose-600'];
            const colorClass = colors[i % colors.length];
            const borderClass = borderColors[i % borderColors.length];
            
            return (
              <button
                key={i}
                onClick={() => scrollTo(i)}
                className={`rounded-full transition-all duration-300 border-2 ${borderClass} ${
                  selected === i
                    ? `w-10 h-3 ${colorClass} shadow-lg scale-110`
                    : `w-3 h-3 ${colorClass} opacity-50 hover:opacity-100 hover:scale-125`
                }`}
                aria-label={`Ir al slide ${i + 1}`}
                aria-current={selected === i ? "true" : "false"}
                type="button"
              />
            );
          })}
        </div>
      </nav>

      <style jsx global>{`
        .embla {
          overflow: hidden;
          transform: translateZ(0);
          will-change: transform;
        }
        
        .embla__container {
          display: flex;
          touch-action: pan-y pinch-zoom;
          backface-visibility: hidden;
        }
        
        .embla__slide {
          flex: 0 0 100%;
          min-width: 0;
        }

        .slide-content {
          animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .slide-image {
          animation: fadeInScale 0.7s cubic-bezier(0.4, 0, 0.2, 1) 0.2s forwards;
          opacity: 0;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
          .slide-content,
          .slide-image {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default memo(HeroCarousel);