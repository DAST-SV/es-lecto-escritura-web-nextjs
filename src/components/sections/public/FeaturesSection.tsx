"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { BookOpen, Zap, Award, Users, DollarSign, LucideIcon, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
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

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  // Auto-rotación optimizada cada 8 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
      const nextIndex = (currentIndex + 1) % tabs.length;
      setActiveTab(tabs[nextIndex].id as TabId);
    }, 8000);

    return () => clearInterval(interval);
  }, [activeTab, tabs]);

  // Precargar solo las 2 primeras imágenes
  useEffect(() => {
    const priorityTabs: TabId[] = ['our_difference', 'for_students'];
    priorityTabs.forEach((tabId) => {
      const img = new Image();
      img.src = imageMap[tabId];
      img.onload = () => {
        setIsImageLoaded(prev => ({ ...prev, [tabId]: true }));
      };
    });
  }, []);

  const handleTabChange = useCallback((tabId: TabId) => {
    setActiveTab(tabId);
    
    // Cargar imagen del tab si no está cargada
    if (!isImageLoaded[tabId]) {
      const img = new Image();
      img.src = imageMap[tabId];
      img.onload = () => {
        setIsImageLoaded(prev => ({ ...prev, [tabId]: true }));
      };
    }
  }, [isImageLoaded]);

  // Navegación mobile optimizada
  const handleMobileNavigation = (direction: 'prev' | 'next') => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    const newIndex = direction === 'prev' 
      ? (currentIndex === 0 ? tabs.length - 1 : currentIndex - 1)
      : (currentIndex + 1) % tabs.length;
    
    handleTabChange(tabs[newIndex].id as TabId);
  };

  return (
    <section className="py-16 lg:py-20 px-4 md:px-8 lg:px-16 bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden">
      {/* Patrón decorativo sutil - Optimizado */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
        backgroundSize: '48px 48px'
      }}></div>

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Título profesional */}
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 leading-tight mb-3">
            {t('title')}
          </h2>
          <div className="w-20 h-1.5 bg-gradient-to-r from-teal-500 to-cyan-500 mx-auto rounded-full"></div>
        </div>

        {/* Desktop Tabs - Profesionales */}
        <div className="hidden md:block mb-10 lg:mb-12">
          <div className="flex flex-wrap justify-center gap-3">
            {tabs.map((tab: FeatureTab, index: number) => {
              const IconComponent = iconMap[tab.id as TabId] || BookOpen;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id || index}
                  onClick={() => handleTabChange(tab.id as TabId)}
                  className={`group relative flex items-center gap-2 px-5 lg:px-6 py-3 lg:py-3.5 rounded-xl font-bold text-sm lg:text-base transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg scale-105'
                      : 'bg-white text-slate-700 hover:bg-slate-50 hover:text-teal-700 shadow-md hover:shadow-lg border border-slate-200'
                  }`}
                >
                  <IconComponent className={`w-4 lg:w-5 h-4 lg:h-5 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-600 group-hover:text-teal-600'
                  }`} />
                  
                  <span className="whitespace-nowrap">{tab.label}</span>
                  
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-lg"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile Navigation - Mejorada */}
        <div className="md:hidden mb-8">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => handleMobileNavigation('prev')}
              className="p-2.5 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-300 hover:bg-teal-50 border border-slate-200"
              aria-label="Tab anterior"
            >
              <ChevronLeft className="w-5 h-5 text-slate-700" />
            </button>
            
            <div className="flex-1">
              <div className="text-center space-y-2">
                <span className="text-xs text-slate-600 font-semibold">
                  {tabs.findIndex(tab => tab.id === activeTab) + 1} / {tabs.length}
                </span>
                <div className="flex justify-center gap-1.5">
                  {tabs.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        tabs.findIndex(tab => tab.id === activeTab) === index
                          ? 'w-8 bg-gradient-to-r from-teal-500 to-cyan-500'
                          : 'w-1.5 bg-slate-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <button
              onClick={() => handleMobileNavigation('next')}
              className="p-2.5 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-300 hover:bg-teal-50 border border-slate-200"
              aria-label="Tab siguiente"
            >
              <ChevronRight className="w-5 h-5 text-slate-700" />
            </button>
          </div>
        </div>

        {/* Tab Content - Optimizado */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[480px] lg:min-h-[560px]">
            
            {/* Content */}
            <div className="p-6 sm:p-8 lg:p-12 xl:p-16 flex flex-col justify-center order-2 lg:order-1">
              <div className="space-y-5 lg:space-y-6">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200">
                  {(() => {
                    const IconComponent = iconMap[activeTab] || BookOpen;
                    return <IconComponent className="w-4 h-4 text-teal-600" />;
                  })()}
                  <span className="text-sm font-bold text-teal-700">{activeTabData?.label}</span>
                </div>

                {/* Título */}
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight">
                  {activeTabData?.title}
                </h3>
                
                {/* Descripción */}
                <p className="text-base lg:text-lg text-slate-600 leading-relaxed font-medium">
                  {activeTabData?.content}
                </p>
                
                {/* CTA */}
                <div className="pt-2">
                  <button className="group inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold px-7 py-3.5 rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <span>{t('button')}</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>

            {/* Image */}
            <div className="relative bg-gradient-to-br from-teal-50 to-cyan-50 p-6 sm:p-8 lg:p-12 order-1 lg:order-2 flex items-center justify-center">
              <div className="relative w-full max-w-sm h-72 sm:h-80 lg:h-96">
                {/* Decoración de fondo */}
                <div className="absolute inset-0 bg-white/40 rounded-2xl transform rotate-3 blur-sm"></div>
                <div className="absolute inset-0 bg-white/30 rounded-2xl transform -rotate-3 blur-sm"></div>
                
                {/* Contenedor de imágenes */}
                <div className="relative z-10 w-full h-full">
                  {Object.entries(imageMap).map(([tabId, imageSrc]) => {
                    const isActive = activeTab === tabId;
                    return (
                      <div
                        key={tabId}
                        className={`absolute inset-0 transition-all duration-500 ${
                          isActive 
                            ? 'opacity-100 scale-100' 
                            : 'opacity-0 scale-95 pointer-events-none'
                        }`}
                      >
                        <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
                          {/* Loading skeleton */}
                          {!isImageLoaded[tabId as TabId] && (
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse"></div>
                          )}
                          
                          <NextImage
                            src={imageSrc}
                            alt={tabs.find(tab => tab.id === tabId)?.title || 'Feature'}
                            fill
                            className="object-cover"
                            priority={tabId === 'our_difference' || tabId === 'for_students'}
                            quality={90}
                            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 80vw, 45vw"
                          />
                          
                          {/* Overlay sutil */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent"></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats - Profesionales */}
        <div className="mt-12 lg:mt-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8">
            {stats.map((stat: Stat, index: number) => {
              const icons: LucideIcon[] = [BookOpen, Zap, Award];
              const IconComponent = icons[index];
              const gradients = [
                'from-blue-500 to-cyan-500',
                'from-teal-500 to-emerald-500',
                'from-orange-500 to-pink-500'
              ];
              const bgGradients = [
                'from-blue-50 to-cyan-50',
                'from-teal-50 to-emerald-50',
                'from-orange-50 to-pink-50'
              ];

              return (
                <div 
                  key={index} 
                  className="group text-center p-6 lg:p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-slate-200"
                >
                  <div className={`w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br ${bgGradients[index]} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className={`w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br ${gradients[index]} bg-clip-text text-transparent`} strokeWidth={2.5} />
                  </div>
                  <h4 className="text-3xl lg:text-4xl font-black text-slate-900 mb-2">
                    {stat.number}
                  </h4>
                  <p className="text-slate-600 text-sm lg:text-base font-semibold">
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