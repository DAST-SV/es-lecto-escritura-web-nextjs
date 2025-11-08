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
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
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
      <div className="hidden xl:flex w-full max-w-6xl items-center justify-between gap-12 mx-auto">
        <div className="w-[52%] space-y-6 slide-content">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/95 backdrop-blur-sm rounded-full shadow-lg border-2 border-teal-200">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span className="text-sm font-bold text-teal-700 tracking-wide">
              Contenido Educativo
            </span>
          </div>
          <h1 className="text-5xl font-black text-white leading-tight tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
            {slide.title}
          </h1>
          <p className="text-lg text-white/95 leading-relaxed font-semibold drop-shadow-[0_2px_8px_rgba(0,0,0,0.2)] max-w-lg">
            {slide.description}
          </p>
          <button
            onClick={() => onNavigate(route)}
            className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-teal-700 font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-teal-50"
            type="button"
            tabIndex={isActive ? 0 : -1}
          >
            {slide.button}
            <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          </button>
        </div>
        <div className="w-[48%] flex justify-center slide-image">
          <div className="relative">
            <div className="absolute -inset-4 bg-white/20 rounded-3xl blur-2xl"></div>
            <NextImage
              src={imageSrc}
              alt={slide.title}
              width={450}
              height={450}
              className="relative rounded-3xl object-cover h-[420px] w-[450px] shadow-2xl border-4 border-white/50"
              priority={isPriority}
              quality={90}
              loading={isPriority ? "eager" : "lazy"}
              sizes="(min-width: 1280px) 450px, 0px"
            />
          </div>
        </div>
      </div>

      {/* LAPTOP (1024-1279px) */}
      <div className="hidden lg:flex xl:hidden w-full max-w-5xl items-center justify-between gap-10 mx-auto">
        <div className="w-[52%] space-y-5 slide-content">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full shadow-lg border-2 border-teal-200">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span className="text-xs font-bold text-teal-700 tracking-wide">
              Contenido Educativo
            </span>
          </div>
          <h1 className="text-4xl font-black text-white leading-tight tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
            {slide.title}
          </h1>
          <p className="text-base text-white/95 leading-relaxed font-semibold drop-shadow-[0_2px_8px_rgba(0,0,0,0.2)] max-w-md">
            {slide.description}
          </p>
          <button
            onClick={() => onNavigate(route)}
            className="group inline-flex items-center gap-2 px-7 py-3.5 bg-white text-teal-700 font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-teal-50"
            type="button"
            tabIndex={isActive ? 0 : -1}
          >
            {slide.button}
            <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
          </button>
        </div>
        <div className="w-[48%] flex justify-center slide-image">
          <div className="relative">
            <div className="absolute -inset-4 bg-white/20 rounded-3xl blur-2xl"></div>
            <NextImage
              src={imageSrc}
              alt={slide.title}
              width={380}
              height={380}
              className="relative rounded-3xl object-cover h-[360px] w-[380px] shadow-2xl border-4 border-white/50"
              priority={isPriority}
              quality={85}
              loading={isPriority ? "eager" : "lazy"}
              sizes="(min-width: 1024px) and (max-width: 1279px) 380px, 0px"
            />
          </div>
        </div>
      </div>

      {/* TABLET (768-1023px) */}
      <div className="hidden md:flex lg:hidden w-full max-w-3xl flex-col items-center text-center space-y-6 mx-auto px-6">
        <div className="space-y-4 slide-content">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full shadow-lg border-2 border-teal-200">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span className="text-xs font-bold text-teal-700 tracking-wide">
              Contenido Educativo
            </span>
          </div>
          <h1 className="text-3xl font-black text-white leading-tight tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
            {slide.title}
          </h1>
        </div>
        <div className="slide-image">
          <div className="relative inline-block">
            <div className="absolute -inset-3 bg-white/20 rounded-2xl blur-xl"></div>
            <NextImage
              src={imageSrc}
              alt={slide.title}
              width={340}
              height={340}
              className="relative rounded-2xl object-cover h-[320px] w-[340px] shadow-xl border-4 border-white/50"
              priority={isPriority}
              quality={80}
              loading={isPriority ? "eager" : "lazy"}
              sizes="(min-width: 768px) and (max-width: 1023px) 340px, 0px"
            />
          </div>
        </div>
        <p className="text-base text-white/95 leading-relaxed font-semibold drop-shadow-[0_2px_8px_rgba(0,0,0,0.2)] max-w-xl">
          {slide.description}
        </p>
        <button
          onClick={() => onNavigate(route)}
          className="group inline-flex items-center gap-2 px-7 py-3.5 bg-white text-teal-700 font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-teal-50"
          type="button"
          tabIndex={isActive ? 0 : -1}
        >
          {slide.button}
          <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
        </button>
      </div>

      {/* MOBILE (640-767px) */}
      <div className="hidden sm:flex md:hidden w-full max-w-md flex-col items-center text-center space-y-5 mx-auto px-4">
        <div className="space-y-3 slide-content">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full shadow-lg border-2 border-teal-200">
            <Sparkles className="w-3 h-3 text-teal-600" />
            <span className="text-xs font-bold text-teal-700 tracking-wide">
              Contenido Educativo
            </span>
          </div>
          <h1 className="text-2xl font-black text-white leading-tight tracking-tight drop-shadow-[0_3px_10px_rgba(0,0,0,0.3)]">
            {slide.title}
          </h1>
        </div>
        <div className="slide-image">
          <div className="relative inline-block">
            <div className="absolute -inset-3 bg-white/20 rounded-2xl blur-xl"></div>
            <NextImage
              src={imageSrc}
              alt={slide.title}
              width={280}
              height={280}
              className="relative rounded-2xl object-cover h-[260px] w-[280px] shadow-xl border-3 border-white/50"
              priority={isPriority}
              quality={75}
              loading={isPriority ? "eager" : "lazy"}
              sizes="(min-width: 640px) and (max-width: 767px) 280px, 0px"
            />
          </div>
        </div>
        <p className="text-sm text-white/95 leading-relaxed font-semibold drop-shadow-[0_2px_6px_rgba(0,0,0,0.2)]">
          {slide.description}
        </p>
        <button
          onClick={() => onNavigate(route)}
          className="group inline-flex items-center gap-2 px-6 py-3 bg-white text-teal-700 font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 w-full justify-center"
          type="button"
          tabIndex={isActive ? 0 : -1}
        >
          {slide.button}
          <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
        </button>
      </div>

      {/* MOBILE SMALL (<640px) */}
      <div className="flex sm:hidden w-full max-w-[300px] flex-col items-center text-center space-y-4 mx-auto px-4">
        <div className="space-y-2 slide-content">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/95 backdrop-blur-sm rounded-full shadow-md border-2 border-teal-200">
            <Sparkles className="w-3 h-3 text-teal-600" />
            <span className="text-[10px] font-bold text-teal-700 tracking-wide">
              Educativo
            </span>
          </div>
          <h1 className="text-xl font-black text-white leading-tight tracking-tight drop-shadow-[0_3px_10px_rgba(0,0,0,0.3)]">
            {slide.title}
          </h1>
        </div>
        <div className="slide-image">
          <NextImage
            src={imageSrc}
            alt={slide.title}
            width={240}
            height={240}
            className="rounded-2xl object-cover h-[220px] w-[240px] shadow-xl border-3 border-white/50"
            priority={isPriority}
            quality={70}
            loading={isPriority ? "eager" : "lazy"}
            sizes="(max-width: 639px) 240px, 0px"
          />
        </div>
        <p className="text-xs text-white/95 leading-relaxed font-semibold drop-shadow-[0_2px_6px_rgba(0,0,0,0.2)]">
          {slide.description}
        </p>
        <button
          onClick={() => onNavigate(route)}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-white text-teal-700 font-bold rounded-xl shadow-lg w-full justify-center text-sm"
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
      {/* Patrón decorativo sutil */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }}></div>

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
              <div className="w-full h-full flex items-center justify-center py-8">
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

      {/* Controles FUERA del contenido */}
      <button
        onClick={scrollPrev}
        className="absolute top-1/2 -translate-y-1/2 left-4 lg:left-8 z-30 p-3 lg:p-4 rounded-full bg-white shadow-2xl hover:scale-110 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
        aria-label="Slide anterior"
        type="button"
      >
        <ChevronLeft className="w-6 h-6 lg:w-7 lg:h-7 text-teal-700" strokeWidth={3} />
      </button>

      <button
        onClick={scrollNext}
        className="absolute top-1/2 -translate-y-1/2 right-4 lg:right-8 z-30 p-3 lg:p-4 rounded-full bg-white shadow-2xl hover:scale-110 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
        aria-label="Slide siguiente"
        type="button"
      >
        <ChevronRight className="w-6 h-6 lg:w-7 lg:h-7 text-teal-700" strokeWidth={3} />
      </button>

      {/* Indicadores modernos */}
      <nav
        className="absolute bottom-6 lg:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-30 bg-white/90 backdrop-blur-sm px-4 py-2.5 rounded-full shadow-xl"
        aria-label="Navegación del carrusel"
      >
        {slides.map((_, i: number) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              selected === i
                ? "w-8 bg-teal-600"
                : "w-2 bg-teal-300 hover:bg-teal-400"
            }`}
            aria-label={`Ir al slide ${i + 1}`}
            aria-current={selected === i ? "true" : "false"}
            type="button"
          />
        ))}
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