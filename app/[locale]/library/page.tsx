  'use client';

  import React, { useState, useEffect, useCallback, useMemo } from "react";
  import { ChevronLeft, ChevronRight, Sparkles, BookOpen, Star, Zap, Heart, Play, TrendingUp, Award, Flame, Crown } from "lucide-react";

  // 🎨 Types
  interface ContentItem {
    caption: string;
    src: string;
    icon?: string;
    rating?: number;
    views?: string;
  }

  interface StarPosition {
    left: string;
    top: string;
    animationDuration: string;
    animationDelay: string;
    fontSize: string;
  }

  // 🎨 Datos de demostración mejorados
  const explorarContenido: ContentItem[] = [
    { caption: "Cuentos Mágicos", src: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&q=80", rating: 5, views: "125K" },
    { caption: "Fábulas Épicas", src: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80", rating: 5, views: "98K" },
    { caption: "Poemas del Alma", src: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80", rating: 4, views: "87K" },
    { caption: "Leyendas Antiguas", src: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=80", rating: 5, views: "112K" },
    { caption: "Refranes Sabios", src: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=800&q=80", rating: 4, views: "76K" },
    { caption: "Historietas Divertidas", src: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80", rating: 5, views: "145K" },
    { caption: "Historias del Abuelo", src: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&q=80", rating: 5, views: "93K" },
    { caption: "Novelas de Aventura", src: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&q=80", rating: 5, views: "156K" },
  ];

  const topLecturas: ContentItem[] = [
    { caption: "El Dragón de las Nubes", src: "https://images.unsplash.com/photo-1589652717521-10c0d092dea9?w=600&q=80", rating: 5, views: "234K" },
    { caption: "El Hámster Viajero", src: "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=600&q=80", rating: 5, views: "198K" },
    { caption: "La Carrera de los Caracoles", src: "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=600&q=80", rating: 4, views: "176K" },
    { caption: "El Reino de los Dulces", src: "https://images.unsplash.com/photo-1514517521153-1be72277b32f?w=600&q=80", rating: 5, views: "289K" },
    { caption: "La Princesa Valiente", src: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80", rating: 5, views: "312K" },
    { caption: "El Bosque Mágico", src: "https://images.unsplash.com/photo-1511300636408-a63a89df3482?w=600&q=80", rating: 5, views: "267K" },
    { caption: "Aventuras en el Espacio", src: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=600&q=80", rating: 4, views: "245K" },
  ];

  const extras: ContentItem[] = [
    { caption: "Crea tu Libro", src: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&q=80", icon: "✏️" },
    { caption: "Diario Personal", src: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&q=80", icon: "📔" },
    { caption: "Mis Libros", src: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600&q=80", icon: "📚" },
  ];

  // 🎨 CAROUSEL ESTILO 1: Hero Full-Screen Ultra Mejorado
  const HeroCarouselStyle1: React.FC<{ items: ContentItem[]; autoPlayDelay?: number }> = ({ 
    items, 
    autoPlayDelay = 7000 
  }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [direction, setDirection] = useState<'next' | 'prev'>('next');
    const [isPaused, setIsPaused] = useState(false);
    const [imageLoaded, setImageLoaded] = useState<Record<number, boolean>>({});
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    // Generar estrellas y partículas flotantes
    const stars = useMemo<StarPosition[]>(() => 
      Array.from({ length: 40 }, (_, i) => ({
        left: `${(i * 23.7 + 15.3) % 100}%`,
        top: `${(i * 31.9 + 8.7) % 100}%`,
        animationDuration: `${2 + (i % 5)}s`,
        animationDelay: `${(i % 4) * 0.4}s`,
        fontSize: `${8 + (i % 16)}px`
      })), []
    );

    const floatingElements = useMemo(() => 
      ['📚', '✨', '🌟', '💫', '🎨', '🚀', '🌈', '⭐'].map((emoji, i) => ({
        emoji,
        left: `${(i * 13 + 10) % 90}%`,
        animationDelay: `${i * 0.8}s`,
        animationDuration: `${15 + (i % 5) * 3}s`
      })), []
    );

    const goToSlide = useCallback((index: number, dir: 'next' | 'prev' = 'next') => {
      if (isAnimating || index === currentIndex) return;
      setDirection(dir);
      setIsAnimating(true);
      setCurrentIndex(index);
      setTimeout(() => setIsAnimating(false), 900);
    }, [isAnimating, currentIndex]);

    const goToPrevious = useCallback(() => {
      const newIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
      goToSlide(newIndex, 'prev');
    }, [currentIndex, items.length, goToSlide]);

    const goToNext = useCallback(() => {
      const newIndex = currentIndex === items.length - 1 ? 0 : currentIndex + 1;
      goToSlide(newIndex, 'next');
    }, [currentIndex, items.length, goToSlide]);

    useEffect(() => {
      if (isPaused || isAnimating) return;
      const timer = setInterval(goToNext, autoPlayDelay);
      return () => clearInterval(timer);
    }, [goToNext, autoPlayDelay, isPaused, isAnimating]);

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "ArrowLeft") goToPrevious();
        if (e.key === "ArrowRight") goToNext();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [goToPrevious, goToNext]);

    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent) => {
      setTouchEnd(null);
      setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
      setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
      if (!touchStart || !touchEnd) return;
      const distance = touchStart - touchEnd;
      const isLeftSwipe = distance > minSwipeDistance;
      const isRightSwipe = distance < -minSwipeDistance;
      if (isLeftSwipe) goToNext();
      if (isRightSwipe) goToPrevious();
    };

    useEffect(() => {
      const nextIndex = (currentIndex + 1) % items.length;
      const prevIndex = (currentIndex - 1 + items.length) % items.length;
      [currentIndex, nextIndex, prevIndex].forEach(idx => {
        if (!imageLoaded[idx]) {
          const img = new Image();
          img.src = items[idx].src;
          img.onload = () => setImageLoaded(prev => ({ ...prev, [idx]: true }));
        }
      });
    }, [currentIndex, items, imageLoaded]);

    const currentItem = items[currentIndex];
    const nextItem = items[(currentIndex + 1) % items.length];
    const prevItem = items[(currentIndex - 1 + items.length) % items.length];

    return (
      <div 
        className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Capa de brillo animado */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-tr from-yellow-200/20 via-transparent to-pink-200/20 animate-pulse" />
        </div>

        {/* Estrellas mejoradas */}
        <div className="absolute inset-0 opacity-25 pointer-events-none overflow-hidden">
          {stars.map((star, i) => (
            <div
              key={`star-${i}`}
              className="absolute text-yellow-200 will-change-transform drop-shadow-lg"
              style={{
                left: star.left,
                top: star.top,
                animation: `twinkle ${star.animationDuration} ease-in-out infinite`,
                animationDelay: star.animationDelay,
                fontSize: star.fontSize,
              }}
            >
              ✨
            </div>
          ))}
        </div>

        {/* Elementos flotantes */}
        <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
          {floatingElements.map((element, i) => (
            <div
              key={`float-${i}`}
              className="absolute text-4xl will-change-transform"
              style={{
                left: element.left,
                animation: `float ${element.animationDuration} ease-in-out infinite`,
                animationDelay: element.animationDelay,
              }}
            >
              {element.emoji}
            </div>
          ))}
        </div>

        {/* Background mejorado */}
        <div className="absolute inset-0">
          {items.map((item, index) => (
            <div
              key={`bg-${index}`}
              className="absolute inset-0 transition-all duration-1000 ease-in-out"
              style={{
                opacity: index === currentIndex ? 1 : 0,
                backgroundImage: `url(${item.src})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(20px) brightness(0.5)',
                transform: index === currentIndex ? 'scale(1.1)' : 'scale(1)',
                transition: 'transform 12s ease-out, opacity 1s ease-in-out',
              }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/40 via-transparent to-indigo-900/50" />
          <div className="absolute inset-0 bg-gradient-to-r from-pink-900/20 via-transparent to-blue-900/20" />
        </div>

        {/* Contenido Principal */}
        <div className="relative h-full z-10 flex items-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Texto ultra mejorado */}
              <div
                key={`text-${currentIndex}`}
                className="space-y-8 text-center lg:text-left"
                style={{
                  animation: `${direction === 'next' ? 'slideInLeft' : 'slideInRight'} 0.9s cubic-bezier(0.16, 1, 0.3, 1)`,
                }}
              >
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/98 backdrop-blur-xl rounded-full shadow-2xl border-3 border-yellow-400 hover:scale-105 transition-transform duration-300">
                  <Crown className="w-6 h-6 text-yellow-600 animate-bounce" />
                  <span className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 tracking-wide uppercase">
                    Explorar Contenido Premium
                  </span>
                  <Sparkles className="w-6 h-6 text-pink-600 animate-spin" style={{ animationDuration: '3s' }} />
                </div>

                <h1
                  className="text-5xl sm:text-7xl lg:text-8xl font-black text-white leading-tight transform hover:scale-105 transition-transform duration-500"
                  style={{
                    fontFamily: 'Comic Sans MS, cursive',
                    textShadow: '0 0 30px rgba(255,255,255,0.3), 4px 4px 0px rgba(0,0,0,0.4), 8px 8px 0px rgba(0,0,0,0.2)'
                  }}
                >
                  {currentItem.caption}
                </h1>

                <div className="flex items-center gap-3 justify-center lg:justify-start">
                  <div className="h-2 w-20 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse" />
                  <div className="h-2 w-14 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <div className="h-2 w-8 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                </div>

                {/* Estadísticas */}
                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                  <div className="flex items-center gap-2 bg-white/95 backdrop-blur-xl px-5 py-3 rounded-full shadow-xl border-2 border-yellow-400">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="font-black text-blue-700">{currentItem.rating}/5</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/95 backdrop-blur-xl px-5 py-3 rounded-full shadow-xl border-2 border-pink-400">
                    <TrendingUp className="w-5 h-5 text-pink-600" />
                    <span className="font-black text-purple-700">{currentItem.views} vistas</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/95 backdrop-blur-xl px-5 py-3 rounded-full shadow-xl border-2 border-orange-400 animate-pulse">
                    <Flame className="w-5 h-5 text-orange-600" />
                    <span className="font-black text-orange-700">¡Trending!</span>
                  </div>
                </div>

                <p className="text-2xl sm:text-3xl text-white font-black leading-relaxed max-w-2xl mx-auto lg:mx-0 drop-shadow-2xl">
                  ¡Descubre mundos mágicos llenos de aventura, emoción y aprendizaje! 🌟📚✨
                </p>

                <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start items-center">
                  <button
                    className="group relative px-10 py-5 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white font-black text-xl rounded-full shadow-2xl hover:shadow-yellow-400/50 transition-all duration-300 hover:scale-110 active:scale-95 border-4 border-white overflow-hidden"
                    onClick={() => console.log('Explorar:', currentItem.caption)}
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      <Play className="w-6 h-6 group-hover:scale-125 transition-transform" fill="currentColor" />
                      ¡Explorar Ahora!
                      <Sparkles className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </button>

                  <div className="flex items-center gap-3 px-6 py-4 bg-white/95 backdrop-blur-xl rounded-full shadow-2xl border-3 border-purple-400">
                    <span className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {currentIndex + 1}
                    </span>
                    <span className="text-gray-400 font-black text-xl">/</span>
                    <span className="text-xl font-black text-gray-600">{items.length}</span>
                  </div>
                </div>
              </div>

              {/* Imagen principal ultra mejorada */}
              <div className="relative flex justify-center items-center">
                <div
                  key={`image-${currentIndex}`}
                  className="relative z-20"
                  style={{
                    animation: `${direction === 'next' ? 'flipInRight' : 'flipInLeft'} 0.9s cubic-bezier(0.16, 1, 0.3, 1)`,
                  }}
                >
                  {/* Glow effect múltiple */}
                  <div className="absolute -inset-12 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 rounded-full blur-3xl opacity-60 animate-pulse" />
                  <div className="absolute -inset-8 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full blur-2xl opacity-40" style={{ animation: 'pulse 3s ease-in-out infinite' }} />
                  
                  <div className="relative bg-white rounded-3xl p-4 sm:p-5 shadow-2xl border-4 border-yellow-400 transform hover:rotate-3 hover:scale-105 transition-all duration-500 hover:border-pink-400">
                    <div className="relative rounded-2xl overflow-hidden">
                      <img
                        src={currentItem.src}
                        alt={currentItem.caption}
                        className="rounded-2xl object-cover w-full h-[320px] sm:h-[420px] lg:h-[500px]"
                      />
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    
                    {/* Badges múltiples */}
                    <div className="absolute -top-5 -right-5 flex flex-col gap-2">
                      <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white font-black text-sm sm:text-base px-5 py-2 rounded-full shadow-2xl border-3 border-white transform rotate-12 hover:rotate-0 transition-transform animate-bounce">
                        🏆 Top {currentIndex + 1}
                      </div>
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-black text-xs sm:text-sm px-4 py-2 rounded-full shadow-xl border-2 border-white transform -rotate-6 hover:rotate-0 transition-transform">
                        ⭐ {currentItem.rating}/5
                      </div>
                    </div>

                    <div className="absolute -bottom-5 -left-5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-black text-xs sm:text-sm px-5 py-2 rounded-full shadow-xl border-3 border-white transform -rotate-12 hover:rotate-0 transition-transform">
                      👁️ {currentItem.views}
                    </div>
                  </div>
                </div>

                {/* Miniaturas laterales ultra mejoradas */}
                {prevItem && (
                  <button
                    onClick={goToPrevious}
                    className="hidden xl:block absolute -left-28 top-1/2 -translate-y-1/2 z-10 transition-all duration-300 hover:scale-125 hover:-left-24 focus:outline-none group"
                    aria-label="Anterior"
                  >
                    <div className="relative">
                      <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur-lg opacity-50 group-hover:opacity-100 transition-opacity" />
                      <div className="relative bg-white rounded-2xl p-3 shadow-2xl border-4 border-blue-400 transform -rotate-12 group-hover:rotate-0 transition-all">
                        <img src={prevItem.src} alt="Anterior" className="rounded-xl object-cover w-28 h-28" />
                      </div>
                    </div>
                  </button>
                )}

                {nextItem && (
                  <button
                    onClick={goToNext}
                    className="hidden xl:block absolute -right-28 top-1/2 -translate-y-1/2 z-10 transition-all duration-300 hover:scale-125 hover:-right-24 focus:outline-none group"
                    aria-label="Siguiente"
                  >
                    <div className="relative">
                      <div className="absolute -inset-2 bg-gradient-to-r from-pink-400 to-purple-400 rounded-2xl blur-lg opacity-50 group-hover:opacity-100 transition-opacity" />
                      <div className="relative bg-white rounded-2xl p-3 shadow-2xl border-4 border-pink-400 transform rotate-12 group-hover:rotate-0 transition-all">
                        <img src={nextItem.src} alt="Siguiente" className="rounded-xl object-cover w-28 h-28" />
                      </div>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Controles mejorados */}
        <button 
          onClick={goToPrevious} 
          disabled={isAnimating}
          aria-label="Anterior"
          className="absolute top-1/2 -translate-y-1/2 left-4 lg:left-8 z-40 p-4 sm:p-5 rounded-full bg-white/98 backdrop-blur-xl shadow-2xl hover:scale-125 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border-3 border-yellow-400 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 focus:outline-none focus:ring-4 focus:ring-yellow-300 group"
        >
          <ChevronLeft className="w-7 h-7 sm:w-8 sm:h-8 text-blue-700 group-hover:-translate-x-1 transition-transform" strokeWidth={4} />
        </button>

        <button 
          onClick={goToNext} 
          disabled={isAnimating}
          aria-label="Siguiente"
          className="absolute top-1/2 -translate-y-1/2 right-4 lg:right-8 z-40 p-4 sm:p-5 rounded-full bg-white/98 backdrop-blur-xl shadow-2xl hover:scale-125 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border-3 border-yellow-400 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 focus:outline-none focus:ring-4 focus:ring-yellow-300 group"
        >
          <ChevronRight className="w-7 h-7 sm:w-8 sm:h-8 text-blue-700 group-hover:translate-x-1 transition-transform" strokeWidth={4} />
        </button>

        {/* Indicadores ultra mejorados */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 w-full max-w-5xl px-4">
          <div className="bg-white/98 backdrop-blur-xl rounded-3xl shadow-2xl border-3 border-yellow-400 p-4 sm:p-5">
            <div className="flex items-center justify-center gap-3 overflow-x-auto scrollbar-hide">
              {items.map((item, index) => {
                const isActive = currentIndex === index;
                const isAdjacent = Math.abs(currentIndex - index) === 1 || 
                                  (currentIndex === 0 && index === items.length - 1) || 
                                  (currentIndex === items.length - 1 && index === 0);
                
                return (
                  <button
                    key={index}
                    onClick={() => goToSlide(index, index > currentIndex ? 'next' : 'prev')}
                    disabled={isAnimating}
                    aria-label={`Ir a ${item.caption}`}
                    className={`relative flex-shrink-0 transition-all duration-500 rounded-2xl overflow-hidden focus:outline-none focus:ring-4 focus:ring-blue-400 group ${
                      isActive 
                        ? "w-24 sm:w-32 h-24 sm:h-32 border-4 border-yellow-500 shadow-2xl scale-110 ring-4 ring-yellow-300/50" 
                        : isAdjacent
                        ? "w-16 sm:w-20 h-16 sm:h-20 border-3 border-pink-400 opacity-80 hover:opacity-100 hover:scale-110"
                        : "w-12 sm:w-14 h-12 sm:h-14 border-2 border-blue-300 opacity-50 hover:opacity-75 hover:scale-110"
                    }`}
                  >
                    <img 
                      src={item.src} 
                      alt={item.caption} 
                      className="w-full h-full object-cover" 
                    />
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-center pb-2">
                        <span className="text-white text-xs font-black">{item.caption}</span>
                      </div>
                    )}
                    {!isActive && (
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <style>{`
          @keyframes slideInLeft { 
            from { opacity: 0; transform: translateX(-80px); } 
            to { opacity: 1; transform: translateX(0); } 
          }
          @keyframes slideInRight { 
            from { opacity: 0; transform: translateX(80px); } 
            to { opacity: 1; transform: translateX(0); } 
          }
          @keyframes flipInRight { 
            from { opacity: 0; transform: perspective(1200px) rotateY(-50deg) scale(0.85); } 
            to { opacity: 1; transform: perspective(1200px) rotateY(0) scale(1); } 
          }
          @keyframes flipInLeft { 
            from { opacity: 0; transform: perspective(1200px) rotateY(50deg) scale(0.85); } 
            to { opacity: 1; transform: perspective(1200px) rotateY(0) scale(1); } 
          }
          @keyframes twinkle { 
            0%, 100% { opacity: 0.2; transform: scale(0.8) rotate(0deg); } 
            50% { opacity: 1; transform: scale(1.3) rotate(180deg); } 
          }
          @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.6; }
            50% { transform: translateY(-30px) rotate(10deg); opacity: 1; }
          }
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </div>
    );
  };

  // 🎨 CAROUSEL ESTILO 2: 3D Cinematográfico Ultra Premium
  const HeroCarouselStyle2: React.FC<{ items: ContentItem[]; onItemClick: (item: ContentItem) => void }> = ({ 
    items, 
    onItemClick 
  }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const goToPrevious = () => {
      if (isAnimating) return;
      setIsAnimating(true);
      setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
      setTimeout(() => setIsAnimating(false), 700);
    };

    const goToNext = () => {
      if (isAnimating) return;
      setIsAnimating(true);
      setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
      setTimeout(() => setIsAnimating(false), 700);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
      setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
      setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
      if (touchStart - touchEnd > 75) goToNext();
      if (touchStart - touchEnd < -75) goToPrevious();
    };

    const getVisibleItems = () => {
      const visible = [];
      for (let i = -3; i <= 3; i++) {
        const index = (currentIndex + i + items.length) % items.length;
        visible.push({ item: items[index], position: i, index });
      }
      return visible;
    };

    return (
      <div className="relative py-20 px-4 overflow-hidden bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50">
        {/* Fondo decorativo animado */}
        <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header ultra premium */}
          <div className="text-center mb-16 space-y-6">
            <div className="inline-flex items-center gap-4 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 px-8 py-4 rounded-full shadow-2xl border-4 border-white transform hover:scale-110 transition-all duration-300 hover:rotate-2">
              <Award className="w-8 h-8 text-white animate-bounce" />
              <span className="text-2xl font-black text-white tracking-wider">TOP 10 LECTURAS</span>
              <Trophy className="w-8 h-8 text-white animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
            
            <h2 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent transform hover:scale-105 transition-transform duration-300" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
              ¡Las Más Populares del Universo! 🏆✨
            </h2>
            
            <div className="flex items-center gap-3 justify-center">
              <div className="h-2 w-24 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse" />
              <div style={{ animationDuration: '3s' }} className="animate-spin">
                <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
              </div>
              <div className="h-2 w-16 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div style={{ animationDuration: '3s', animationDirection: 'reverse' }} className="animate-spin">
                <Star className="w-6 h-6 text-pink-500 fill-pink-500" />
              </div>
              <div className="h-2 w-12 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>

            <p className="text-xl md:text-2xl text-gray-700 font-bold max-w-3xl mx-auto">
              Descubre las historias que han conquistado millones de corazones ❤️📖
            </p>
          </div>

          {/* Carrusel 3D Ultra Premium */}
          <div 
            className="relative h-[600px] flex items-center justify-center mb-16"
            style={{ perspective: '2500px' }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {getVisibleItems().map(({ item, position, index }) => {
              const isCenter = position === 0;
              const isAdjacent = Math.abs(position) === 1;
              const isSecondary = Math.abs(position) === 2;
              const distance = Math.abs(position);
              
              const scale = isCenter ? 1.1 : isAdjacent ? 0.9 : isSecondary ? 0.75 : 0.6;
              const opacity = isCenter ? 1 : isAdjacent ? 0.8 : isSecondary ? 0.5 : 0.3;
              const zIndex = 100 - distance * 10;
              const translateX = position * (isCenter ? 0 : isAdjacent ? 320 : isSecondary ? 400 : 450);
              const rotateY = position * (isAdjacent ? 15 : isSecondary ? 25 : 35);
              const blur = isCenter ? 0 : isAdjacent ? 0.5 : isSecondary ? 2 : 4;
              const brightness = isCenter ? 1 : isAdjacent ? 0.9 : 0.7;
              
              return (
                <div
                  key={index}
                  className={`absolute transition-all duration-700 ease-out ${isCenter ? 'cursor-pointer' : 'pointer-events-none'}`}
                  style={{ 
                    transform: `translateX(${translateX}px) translateZ(${isCenter ? 100 : -150}px) scale(${scale}) rotateY(${rotateY}deg)`,
                    opacity,
                    zIndex,
                    filter: `blur(${blur}px) brightness(${brightness})`,
                  }}
                  onClick={() => isCenter && onItemClick(item)}
                  onMouseEnter={() => isCenter && setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className={`relative bg-white rounded-3xl shadow-2xl overflow-hidden border-4 transition-all duration-500 ${
                    isCenter 
                      ? 'border-yellow-400 shadow-yellow-400/50 hover:shadow-yellow-400/80' 
                      : isAdjacent
                      ? 'border-pink-300 shadow-pink-300/30'
                      : 'border-blue-200'
                  }`}>
                    {/* Brillo animado */}
                    {isCenter && hoveredIndex === index && (
                      <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400/20 via-transparent to-pink-400/20 animate-pulse pointer-events-none z-10" />
                    )}

                    <div className="relative">
                      <img 
                        src={item.src} 
                        alt={item.caption} 
                        className={`w-[320px] h-[400px] object-cover transition-transform duration-700 ${
                          isCenter && hoveredIndex === index ? 'scale-110' : ''
                        }`}
                      />
                      
                      {/* Overlay gradient mejorado */}
                      {isCenter && (
                        <>
                          <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-500 ${
                            hoveredIndex === index ? 'opacity-100' : 'opacity-0'
                          }`} />
                          
                          {/* Badges múltiples */}
                          <div className="absolute top-4 right-4 flex flex-col gap-2">
                            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-black text-base px-4 py-2 rounded-full shadow-xl border-3 border-white animate-bounce flex items-center gap-2">
                              <Crown className="w-5 h-5" />
                              #{currentIndex + 1}
                            </div>
                            <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white font-black text-sm px-4 py-2 rounded-full shadow-xl border-2 border-white flex items-center gap-1">
                              <Star className="w-4 h-4 fill-white" />
                              {item.rating}/5
                            </div>
                          </div>

                          <div className="absolute top-4 left-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-black text-sm px-4 py-2 rounded-full shadow-xl border-2 border-white flex items-center gap-2 animate-pulse">
                            <TrendingUp className="w-4 h-4" />
                            {item.views}
                          </div>

                          {/* Botón de reproducción */}
                          {hoveredIndex === index && (
                            <div className="absolute inset-0 flex items-center justify-center z-20">
                              <div className="bg-white/95 backdrop-blur-sm p-6 rounded-full shadow-2xl border-4 border-yellow-400 animate-pulse hover:scale-125 transition-transform">
                                <Play className="w-12 h-12 text-blue-600" fill="currentColor" />
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Información del libro */}
                    <div className={`p-6 bg-gradient-to-br from-blue-50 to-purple-50 transition-all duration-500 ${
                      isCenter ? 'min-h-[140px]' : 'min-h-[100px]'
                    }`}>
                      <h3 className={`font-black text-blue-700 text-center mb-3 transition-all ${
                        isCenter ? 'text-xl' : isAdjacent ? 'text-lg' : 'text-base'
                      }`} style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                        {item.caption}
                      </h3>
                      
                      {isCenter && (
                        <>
                          <div className="flex items-center justify-center gap-4 mb-4">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-5 h-5 ${i < (item.rating || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                          </div>
                          
                          <button className="w-full bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white font-black py-4 rounded-full hover:from-yellow-500 hover:to-red-500 transition-all duration-300 border-3 border-white shadow-2xl hover:shadow-yellow-400/50 hover:scale-105 active:scale-95 flex items-center justify-center gap-3 group">
                            <BookOpen className="w-6 h-6 group-hover:scale-125 transition-transform" />
                            <span className="text-lg">¡Leer Ahora!</span>
                            <Sparkles className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Controles ultra premium */}
          <div className="flex justify-center gap-8 mb-12">
            <button 
              onClick={goToPrevious} 
              disabled={isAnimating}
              aria-label="Anterior"
              className="group relative p-6 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white rounded-full shadow-2xl hover:shadow-blue-500/60 hover:scale-125 active:scale-95 transition-all duration-300 border-4 border-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-blue-300 overflow-hidden"
            >
              <ChevronLeft className="w-8 h-8 relative z-10 group-hover:-translate-x-2 transition-transform duration-300" strokeWidth={4} />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
            
            <div className="flex items-center gap-4 px-8 py-4 bg-white/95 backdrop-blur-xl rounded-full shadow-2xl border-4 border-yellow-400">
              <span className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {currentIndex + 1}
              </span>
              <span className="text-gray-400 font-black text-2xl">/</span>
              <span className="text-2xl font-black text-gray-600">{items.length}</span>
            </div>
            
            <button 
              onClick={goToNext} 
              disabled={isAnimating}
              aria-label="Siguiente"
              className="group relative p-6 bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 text-white rounded-full shadow-2xl hover:shadow-green-500/60 hover:scale-125 active:scale-95 transition-all duration-300 border-4 border-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-green-300 overflow-hidden"
            >
              <ChevronRight className="w-8 h-8 relative z-10 group-hover:translate-x-2 transition-transform duration-300" strokeWidth={4} />
              <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </div>

          {/* Indicadores de progreso mejorados */}
          <div className="flex justify-center gap-3 flex-wrap">
            {items.map((_, index) => (
              <button 
                key={index} 
                onClick={() => {
                  if (!isAnimating && index !== currentIndex) {
                    setIsAnimating(true);
                    setCurrentIndex(index);
                    setTimeout(() => setIsAnimating(false), 700);
                  }
                }}
                disabled={isAnimating}
                aria-label={`Ir a lectura ${index + 1}`}
                className={`rounded-full transition-all duration-500 ease-out disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 ${
                  currentIndex === index 
                    ? "w-16 h-5 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 border-4 border-blue-600 shadow-xl ring-4 ring-yellow-300/50" 
                    : "w-5 h-5 bg-gradient-to-r from-blue-300 to-purple-300 hover:from-blue-400 hover:to-purple-400 hover:scale-150 border-2 border-blue-500"
                }`} 
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  // 🎨 Componente Trophy (definición local)
  const Trophy: React.FC<{ className?: string, style?: React.CSSProperties }> = ({ className, style }) => (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
      <path d="M4 22h16"></path>
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
    </svg>
  );

  // 🎨 Sección de Extras Ultra Premium
  const ExtrasSection: React.FC<{ items: ContentItem[] }> = ({ items }) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
      <div className="relative py-20 px-4 overflow-hidden">
        {/* Fondo decorativo */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-100 via-pink-100 to-blue-100 opacity-50" />
        
        {/* Elementos flotantes de fondo */}
        <div className="absolute inset-0 overflow-hidden opacity-5 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute text-6xl"
              style={{
                left: `${(i * 17 + 5) % 100}%`,
                top: `${(i * 23 + 10) % 100}%`,
                animation: `float ${15 + (i % 5) * 2}s ease-in-out infinite`,
                animationDelay: `${i * 0.5}s`,
              }}
            >
              {['✨', '📚', '✏️', '🎨', '💫'][i % 5]}
            </div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border-4 border-yellow-400">
            <div className="text-center mb-12 space-y-6">
              <div className="inline-flex items-center gap-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-white px-8 py-4 rounded-full shadow-2xl border-4 border-white transform hover:scale-110 transition-all duration-300 hover:rotate-2">
                <div className="animate-pulse">
                  <Zap className="w-8 h-8" />
                </div>
                <span className="text-2xl font-black tracking-wider">HERRAMIENTAS CREATIVAS</span>
                <div className="animate-pulse" style={{ animationDelay: '0.5s' }}>
                  <Sparkles className="w-8 h-8" />
                </div>
              </div>
              
              <h2 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent transform hover:scale-105 transition-transform" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                ¡Crea tu Propia Magia! 🌟✨
              </h2>
              
              <div className="flex items-center gap-3 justify-center">
                <div className="h-2 w-24 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse" />
                <Sparkles className="w-6 h-6 text-purple-500 animate-spin" style={{ animationDuration: '4s' }} />
                <div className="h-2 w-16 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
              </div>

              <p className="text-xl md:text-2xl text-gray-700 font-bold max-w-3xl mx-auto">
                Desata tu creatividad con nuestras herramientas especiales 🎨🚀
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {items.map((item, index) => (
                <div 
                  key={index} 
                  className="group cursor-pointer transform transition-all duration-500 hover:scale-110 hover:-rotate-2"
                  onClick={() => console.log(`Clicked: ${item.caption}`)}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-yellow-400 bg-white hover:border-pink-400 transition-all duration-500 hover:shadow-pink-400/50">
                    {/* Brillo animado */}
                    {hoveredIndex === index && (
                      <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400/30 via-pink-400/30 to-purple-400/30 animate-pulse z-10 pointer-events-none" />
                    )}

                    <div className="relative overflow-hidden">
                      <img 
                        src={item.src} 
                        alt={item.caption} 
                        className={`w-full h-[260px] object-cover transition-all duration-700 ${
                          hoveredIndex === index ? 'scale-125 rotate-3' : 'scale-100'
                        }`}
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t from-purple-900/80 via-transparent to-transparent transition-opacity duration-500 ${
                        hoveredIndex === index ? 'opacity-100' : 'opacity-0'
                      }`} />
                      
                      <div className={`absolute top-6 left-6 text-6xl transform transition-all duration-500 ${
                        hoveredIndex === index ? 'scale-150 rotate-12' : 'scale-100'
                      }`}>
                        {item.icon}
                      </div>

                      {/* Badge premium */}
                      <div className="absolute top-6 right-6 bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-black text-xs px-4 py-2 rounded-full shadow-xl border-2 border-white animate-bounce">
                        ⭐ Premium
                      </div>
                    </div>

                    <div className="p-6 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
                      <h3 className="text-2xl font-black text-blue-700 text-center mb-4 group-hover:text-purple-700 transition-colors" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                        {item.caption}
                      </h3>
                      
                      <button className="w-full bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white font-black py-4 rounded-full hover:from-yellow-500 hover:to-red-500 transition-all duration-300 border-3 border-white shadow-2xl hover:shadow-yellow-400/50 active:scale-95 flex items-center justify-center gap-3 group relative overflow-hidden">
                        <span className="relative z-10 text-lg">¡Empezar Ahora!</span>
                        <Sparkles className="relative z-10 w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 🎨 Footer Motivacional Ultra Premium
  const MotivationalFooter: React.FC = () => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <div className="text-center py-16 px-4 relative overflow-hidden">
        {/* Fondo animado */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-100 to-pink-100 opacity-50" />
        
        <div 
          className="relative inline-block"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className={`bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 text-white px-12 py-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 cursor-pointer border-4 border-white transform ${
            isHovered ? 'scale-110 rotate-2' : 'scale-100 rotate-0'
          }`}>
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="animate-pulse" style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
                <Heart className="w-10 h-10" fill="currentColor" />
              </div>
              <p className="text-4xl font-black" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                ¡Tu Aventura Comienza Aquí!
              </p>
              <div className="animate-pulse" style={{ animation: 'pulse 1.5s ease-in-out infinite', animationDelay: '0.3s' }}>
                <Heart className="w-10 h-10" fill="currentColor" />
              </div>
            </div>
            
            <p className="text-2xl font-black flex items-center justify-center gap-4 flex-wrap" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
              <span className={`transition-all duration-300 ${isHovered ? 'scale-125' : ''}`}>📚 Lee</span>
              <span>•</span>
              <span className={`transition-all duration-300 ${isHovered ? 'scale-125' : ''}`} style={{ transitionDelay: '0.1s' }}>✨ Aprende</span>
              <span>•</span>
              <span className={`transition-all duration-300 ${isHovered ? 'scale-125' : ''}`} style={{ transitionDelay: '0.2s' }}>🚀 Crea</span>
              <span>•</span>
              <span className={`transition-all duration-300 ${isHovered ? 'scale-125' : ''}`} style={{ transitionDelay: '0.3s' }}>🌟 Brilla</span>
            </p>

            {/* Chispas animadas */}
            {isHovered && (
              <>
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute text-2xl animate-ping"
                    style={{
                      left: `${10 + i * 12}%`,
                      top: `${i % 2 === 0 ? -20 : 120}%`,
                      animationDelay: `${i * 0.2}s`,
                      animationDuration: '1s',
                    }}
                  >
                    ✨
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Sombra y glow effect */}
          <div className={`absolute -inset-4 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 rounded-3xl blur-2xl opacity-30 transition-opacity duration-500 -z-10 ${
            isHovered ? 'opacity-60' : 'opacity-30'
          }`} />
        </div>
      </div>
    );
  };

  // 🎯 Componente Principal
  const ContentExplorer: React.FC = () => {
    const handleTopLecturaClick = (item: ContentItem) => {
      console.log('Lectura seleccionada:', item.caption);
      // Aquí puedes agregar navegación o abrir modal
    };

    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50">
        {/* Hero Carousel */}
        <HeroCarouselStyle1 items={explorarContenido} autoPlayDelay={7000} />
        
        {/* Top Lecturas Carousel */}
        <HeroCarouselStyle2 items={topLecturas} onItemClick={handleTopLecturaClick} />
        
        {/* Extras Section */}
        <ExtrasSection items={extras} />
        
        {/* Motivational Footer */}
        <MotivationalFooter />
      </div>
    );
  };

  export default ContentExplorer;