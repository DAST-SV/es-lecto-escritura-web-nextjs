"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { BookOpen, Zap, Award, Users, DollarSign, LucideIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import type { FeatureTab, Stat } from './type';
import { images } from '@/public/images';
import { NextImage } from '../../ui/NextImage';

type TabId = 'our_difference' | 'for_students' | 'for_parents' | 'for_teachers' | 'plans_and_pricing';

const iconMap: Record<TabId, LucideIcon> = {
  'our_difference': BookOpen,
  'for_students': Zap,
  'for_parents': Award,
  'for_teachers': Users,
  'plans_and_pricing': DollarSign
};

const imageMap: Record<TabId, string> = {
  'our_difference': images.tabs.diferencia,
  'for_students': images.tabs.estudiante,
  'for_parents': images.tabs.padre,
  'for_teachers': images.tabs.docente,
  'plans_and_pricing': images.tabs.precio
};

const FeaturesSection: React.FC = () => {
  const t = useTranslations('features');
  const tabs: FeatureTab[] = t.raw('tabs');
  const stats: Stat[] = t.raw('stats');
  const [activeTab, setActiveTab] = useState<TabId>('our_difference');
  const [isImageLoaded, setIsImageLoaded] = useState<Record<TabId, boolean>>({} as Record<TabId, boolean>);
  const [currentMobileTab, setCurrentMobileTab] = useState(0);

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  // Auto-rotación de tabs cada 8 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
      const nextIndex = (currentIndex + 1) % tabs.length;
      setActiveTab(tabs[nextIndex].id as TabId);
    }, 8000);

    return () => clearInterval(interval);
  }, [activeTab, tabs]);

  // Precargar imágenes
  useEffect(() => {
    Object.entries(imageMap).forEach(([tabId, imageSrc]) => {
      const img = new Image();
      img.src = imageSrc;
      img.onload = () => {
        setIsImageLoaded(prev => ({ ...prev, [tabId]: true }));
      };
    });
  }, []);

  const handleTabChange = useCallback((tabId: TabId) => {
    setActiveTab(tabId);
  }, []);

  // Navegación mobile con flechas
  const handleMobileNavigation = (direction: 'prev' | 'next') => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
    } else {
      newIndex = (currentIndex + 1) % tabs.length;
    }
    
    setActiveTab(tabs[newIndex].id as TabId);
    setCurrentMobileTab(newIndex);
  };

  return (
    <section className="py-20 px-4 md:px-8 lg:px-16 bg-gradient-to-br from-gray-50 via-blue-50/30 to-green-50/30 relative overflow-hidden">
      {/* Elementos decorativos mejorados */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Círculos flotantes */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-blue-200/20 to-cyan-200/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-orange-200/20 to-pink-200/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-r from-green-200/20 to-teal-200/20 rounded-full blur-xl animate-pulse delay-2000"></div>
        
        {/* Formas geométricas */}
        <svg className="absolute -left-20 top-10 text-blue-100/50" width="200" height="400" viewBox="0 0 200 400" fill="none">
          <path d="M-50 50C-50 100 0 150 50 150C100 150 150 200 150 250C150 300 100 350 50 350"
            stroke="currentColor" strokeWidth="2" fill="none" opacity="0.4" 
            className="animate-pulse" />
        </svg>
        <svg className="absolute -right-20 bottom-10 text-orange-100/50" width="200" height="400" viewBox="0 0 200 400" fill="none">
          <path d="M250 350C250 300 200 250 150 250C100 250 50 200 50 150C50 100 100 50 150 50"
            stroke="currentColor" strokeWidth="2" fill="none" opacity="0.4" 
            className="animate-pulse delay-500" />
        </svg>
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Título mejorado */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-800 via-blue-700 to-green-700 bg-clip-text text-transparent leading-tight mb-4">
            {t('title')}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-green-500 mx-auto rounded-full"></div>
        </div>

        {/* Desktop Tabs - Mejoradas */}
        <div className="hidden md:block mb-12">
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 lg:gap-4">
            {tabs.map((tab: FeatureTab, index: number) => {
              const IconComponent = iconMap[tab.id as TabId] || BookOpen;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id || index}
                  onClick={() => handleTabChange(tab.id as TabId)}
                  className={`group relative flex items-center gap-2 px-4 md:px-5 lg:px-6 py-3 md:py-4 rounded-xl font-semibold text-sm md:text-base transition-all duration-500 transform hover:scale-105 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-green-500 text-white shadow-2xl shadow-blue-500/25'
                      : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:text-blue-600 shadow-lg hover:shadow-xl border border-gray-200/50'
                  }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-green-500 rounded-xl blur-lg opacity-30 -z-10"></div>
                  )}
                  
                  <IconComponent className={`w-4 md:w-5 h-4 md:h-5 transition-all duration-300 ${
                    isActive ? 'text-white' : 'text-gray-600 group-hover:text-blue-600'
                  }`} />
                  
                  <span className="relative z-10 whitespace-nowrap">{tab.label}</span>
                  
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile Navigation - Mejorada */}
        <div className="md:hidden mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => handleMobileNavigation('prev')}
              className="p-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-blue-50"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="flex-1 mx-4">
              <div className="text-center">
                <span className="text-sm text-gray-500 font-medium">
                  {tabs.findIndex(tab => tab.id === activeTab) + 1} de {tabs.length}
                </span>
                <div className="flex justify-center mt-2 gap-2">
                  {tabs.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        tabs.findIndex(tab => tab.id === activeTab) === index
                          ? 'w-8 bg-gradient-to-r from-blue-500 to-green-500'
                          : 'w-2 bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <button
              onClick={() => handleMobileNavigation('next')}
              className="p-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-blue-50"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Tab Content - Mejorado */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl shadow-gray-500/10 overflow-hidden border border-gray-200/50">
          <div className="grid grid-cols-1 lg:grid-cols-5 min-h-[500px] md:min-h-[600px]">
            
            {/* Content - Más espacio */}
            <div className="lg:col-span-3 p-6 sm:p-8 md:p-10 lg:p-12 xl:p-16 flex flex-col justify-center order-2 lg:order-1">
              <div className="space-y-4 md:space-y-6">
                {/* Badge del tab activo */}
                <div className="inline-flex items-center gap-2 px-3 md:px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-green-100 text-blue-700 text-xs md:text-sm font-medium">
                  {(() => {
                    const IconComponent = iconMap[activeTab] || BookOpen;
                    return <IconComponent className="w-3 md:w-4 h-3 md:h-4" />;
                  })()}
                  <span>{activeTabData?.label}</span>
                </div>

                <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-bold text-gray-900 leading-tight">
                  {activeTabData?.title}
                </h3>
                
                <div className="text-gray-600 text-base sm:text-lg md:text-xl leading-relaxed space-y-3 md:space-y-4">
                  <p>{activeTabData?.content}</p>
                </div>
                
                <div className="pt-2 md:pt-4">
                  <button className="group relative bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white font-bold px-6 sm:px-8 md:px-10 py-3 md:py-4 text-sm md:text-base rounded-xl hover:from-orange-600 hover:via-red-600 hover:to-pink-600 transition-all duration-500 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105 overflow-hidden">
                    <span className="relative z-10 flex items-center gap-2">
                      {t('button')}
                      <ChevronRight className="w-4 md:w-5 h-4 md:h-5 transition-transform group-hover:translate-x-1" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </div>
              </div>
            </div>

            {/* Image - Mejorada */}
            <div className="lg:col-span-2 relative bg-gradient-to-br from-blue-50 via-indigo-50 to-green-50 p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 order-1 lg:order-2 flex items-center justify-center overflow-hidden">
              <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-sm h-72 sm:h-80 md:h-96 lg:h-80 xl:h-96 mx-auto">
                {/* Elementos decorativos de fondo - Estables */}
                <div className="absolute top-2 left-2 right-4 bottom-4 bg-gradient-to-r from-blue-400/12 to-green-400/12 rounded-2xl transform rotate-2 blur-sm will-change-transform"></div>
                <div className="absolute top-4 left-4 right-2 bottom-2 bg-gradient-to-r from-purple-400/6 to-pink-400/6 rounded-2xl transform -rotate-2 blur-sm will-change-transform"></div>
                
                {/* Contenedor de imágenes */}
                <div className="relative z-10 w-full h-full">
                  {Object.entries(imageMap).map(([tabId, imageSrc]) => {
                    const isActive = activeTab === tabId;
                    return (
                      <div
                        key={tabId}
                        className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                          isActive 
                            ? 'opacity-100 scale-100 rotate-0' 
                            : 'opacity-0 scale-95 rotate-1 pointer-events-none'
                        }`}
                      >
                        <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-xl will-change-transform">
                          {/* Loading skeleton */}
                          {!isImageLoaded[tabId as TabId] && (
                            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse rounded-2xl"></div>
                          )}
                          
                          <NextImage
                            src={imageSrc}
                            alt={tabs.find(tab => tab.id === tabId)?.title || 'Feature image'}
                            fill
                            className="object-cover transition-transform duration-700 hover:scale-105 will-change-transform"
                            priority={tabId === 'our_difference' || tabId === 'for_students'}
                            quality={95}
                            sizes="(max-width: 640px) 85vw, (max-width: 768px) 75vw, (max-width: 1024px) 45vw, (max-width: 1280px) 35vw, 400px"
                          />
                          
                          {/* Overlay sutil - Estable */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/8 via-transparent to-transparent rounded-2xl"></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats - Mejoradas */}
        <div className="mt-16 md:mt-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {stats.map((stat: Stat, index: number) => {
              const icons: LucideIcon[] = [BookOpen, Zap, Award];
              const IconComponent = icons[index];
              const colors = [
                { bg: 'bg-gradient-to-br from-blue-100 to-blue-200', text: 'text-blue-600', ring: 'ring-blue-500/20' },
                { bg: 'bg-gradient-to-br from-green-100 to-green-200', text: 'text-green-600', ring: 'ring-green-500/20' },
                { bg: 'bg-gradient-to-br from-yellow-100 to-yellow-200', text: 'text-yellow-600', ring: 'ring-yellow-500/20' }
              ];
              const color = colors[index];

              return (
                <div 
                  key={index} 
                  className="group text-center p-6 md:p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 border border-gray-200/50"
                >
                  <div className={`w-16 md:w-20 h-16 md:h-20 ${color.bg} rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110 ring-4 ${color.ring}`}>
                    <IconComponent className={`w-8 md:w-10 h-8 md:h-10 ${color.text}`} />
                  </div>
                  <h4 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-3 group-hover:text-blue-600 transition-colors duration-300">
                    {stat.number}
                  </h4>
                  <p className="text-gray-600 text-base md:text-lg font-medium">
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;