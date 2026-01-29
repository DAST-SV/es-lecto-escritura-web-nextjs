/**
 * FeaturesSection Component
 * @file src/presentation/features/home/components/FeaturesSection/FeaturesSection.tsx
 * @description Features section matching HeroCarousel's visual style EXACTLY
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BookOpen, Zap, Award, Users, DollarSign, LucideIcon, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

import type { FeatureTab, FeatureTabId, Stat } from '../../types';
import { NextImage } from '@/src/presentation/components/ui/NextImage';
import { imagesConfig } from '@/src/infrastructure/config/images.config';
import { useSupabaseTranslations } from '@/src/presentation/features/translations/hooks/useSupabaseTranslations';

// ============================================
// CONSTANTS
// ============================================

const iconMap: Record<FeatureTabId, LucideIcon> = {
  'our_difference': BookOpen,
  'for_students': Zap,
  'for_parents': Award,
  'for_teachers': Users,
  'plans_and_pricing': DollarSign
};

const imageMap: Record<FeatureTabId, string> = {
  'our_difference': imagesConfig.featureTabs.difference,
  'for_students': imagesConfig.featureTabs.student,
  'for_parents': imagesConfig.featureTabs.parent,
  'for_teachers': imagesConfig.featureTabs.teacher,
  'plans_and_pricing': imagesConfig.featureTabs.pricing
};

// ============================================
// SKELETON COMPONENT
// ============================================

const FeaturesSectionSkeleton: React.FC = () => (
  <section 
    className="relative"
    style={{ minHeight: 'calc(100vh - 60px)' }}
  >
    <div className="container mx-auto max-w-6xl relative z-10 px-4 py-8 flex flex-col">
      {/* Título */}
      <div className="text-center mb-6">
        <div className="h-12 bg-white/30 rounded-2xl w-96 max-w-full mx-auto mb-3 animate-pulse" />
        <div className="flex items-center justify-center gap-2">
          <div className="h-1.5 w-14 bg-yellow-300/50 rounded-full animate-pulse" />
          <div className="h-1.5 w-8 bg-green-300/50 rounded-full animate-pulse" />
          <div className="h-1.5 w-5 bg-blue-300/50 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="hidden md:flex justify-center gap-3 mb-6 flex-wrap">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-11 bg-white/30 rounded-full animate-pulse" style={{ width: `${120 + i * 10}px` }} />
        ))}
      </div>

      {/* Mobile nav skeleton */}
      <div className="md:hidden flex items-center justify-between gap-3 mb-6">
        <div className="p-3 rounded-full bg-white/30 w-11 h-11 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-white/30 rounded w-12 mx-auto animate-pulse" />
          <div className="flex justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full bg-white/30 animate-pulse ${i === 0 ? 'w-7' : 'w-1.5'}`} />
            ))}
          </div>
        </div>
        <div className="p-3 rounded-full bg-white/30 w-11 h-11 animate-pulse" />
      </div>

      {/* Content skeleton */}
      <div className="flex-1 mb-6">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-yellow-300 p-6 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4 animate-pulse">
              <div className="h-8 bg-slate-200 rounded-full w-40" />
              <div className="h-10 bg-slate-200 rounded-lg w-full" />
              <div className="h-10 bg-slate-200 rounded-lg w-4/5" />
              <div className="space-y-2">
                <div className="h-5 bg-slate-200 rounded w-full" />
                <div className="h-5 bg-slate-200 rounded w-11/12" />
              </div>
              <div className="h-12 bg-slate-200 rounded-full w-44" />
            </div>
            <div className="relative h-64 bg-slate-200 rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white/90 rounded-2xl p-4 text-center border-3 border-yellow-300 shadow-xl">
            <div className="animate-pulse space-y-2">
              <div className="w-14 h-14 bg-slate-200 rounded-full mx-auto" />
              <div className="h-8 bg-slate-200 rounded w-16 mx-auto" />
              <div className="h-4 bg-slate-200 rounded w-24 mx-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ============================================
// MAIN COMPONENT
// ============================================

export const FeaturesSection: React.FC = () => {
  const { t, tArray, loading } = useSupabaseTranslations('features');
  
  const [activeTab, setActiveTab] = useState<FeatureTabId>('our_difference');
  const [isImageLoaded, setIsImageLoaded] = useState<Record<FeatureTabId, boolean>>({} as Record<FeatureTabId, boolean>);

  const tabs = useMemo(() => 
    tArray<FeatureTab>('tabs', ['id', 'label', 'title', 'content']),
    [tArray]
  );

  const stats = useMemo(() => 
    tArray<Stat>('stats', ['number', 'label']),
    [tArray]
  );

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  useEffect(() => {
    if (loading || tabs.length === 0) return;
    const interval = setInterval(() => {
      const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
      const nextIndex = (currentIndex + 1) % tabs.length;
      setActiveTab(tabs[nextIndex].id as FeatureTabId);
    }, 8000);
    return () => clearInterval(interval);
  }, [activeTab, tabs, loading]);

  useEffect(() => {
    // Marcar TODAS las imágenes como cargadas inmediatamente
    const allTabs: FeatureTabId[] = ['our_difference', 'for_students', 'for_parents', 'for_teachers', 'plans_and_pricing'];
    const initialLoadState: Record<FeatureTabId, boolean> = {} as Record<FeatureTabId, boolean>;
    
    allTabs.forEach((tabId) => {
      initialLoadState[tabId] = true; // Marcar como cargada desde el inicio
    });
    
    setIsImageLoaded(initialLoadState);
  }, []);

  const handleTabChange = useCallback((tabId: FeatureTabId) => {
    setActiveTab(tabId);
  }, []);

  const handleMobileNavigation = (direction: 'prev' | 'next') => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    const newIndex = direction === 'prev' 
      ? (currentIndex === 0 ? tabs.length - 1 : currentIndex - 1)
      : (currentIndex + 1) % tabs.length;
    handleTabChange(tabs[newIndex].id as FeatureTabId);
  };

  if (loading || tabs.length === 0) {
    return <FeaturesSectionSkeleton />;
  }

  return (
    <section 
      className="relative"
      style={{ minHeight: 'calc(100vh - 60px)' }}
    >
      <div className="container mx-auto max-w-6xl relative z-10 px-4 py-8 flex flex-col">
        
        {/* Título - estilo HeroCarousel */}
        <div className="text-center mb-6">
          <h2 
            className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-3 drop-shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
            style={{
              fontFamily: 'Comic Sans MS, cursive',
              textShadow: '3px 3px 0px rgba(0,0,0,0.3), 6px 6px 0px rgba(0,0,0,0.1)'
            }}
          >
            {t('title')}
          </h2>
          <div className="flex items-center justify-center gap-3">
            <div className="h-1.5 w-14 bg-yellow-300 rounded-full shadow-lg" />
            <div className="h-1.5 w-8 bg-green-300 rounded-full shadow-lg" />
            <div className="h-1.5 w-5 bg-blue-300 rounded-full shadow-lg" />
          </div>
        </div>

        {/* Desktop Tabs - estilo HeroCarousel */}
        <div className="hidden md:flex justify-center gap-3 mb-6 flex-wrap">
          {tabs.map((tab: FeatureTab) => {
            const IconComponent = iconMap[tab.id as FeatureTabId] || BookOpen;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as FeatureTabId)}
                className={`group relative flex items-center gap-2 px-5 py-2.5 rounded-full font-black text-sm transition-all duration-300 border-2 shadow-2xl ${
                  isActive
                    ? 'bg-yellow-300 text-blue-700 border-white scale-110'
                    : 'bg-white/95 text-blue-600 border-yellow-300 hover:bg-yellow-50 hover:scale-105'
                }`}
                style={{ fontFamily: 'Comic Sans MS, cursive' }}
              >
                <IconComponent className="w-4 h-4" />
                <span>{tab.label}</span>
                {isActive && <Sparkles className="w-3.5 h-3.5 animate-pulse" />}
              </button>
            );
          })}
        </div>

        {/* Mobile Navigation - estilo HeroCarousel */}
        <div className="md:hidden flex items-center justify-between gap-3 mb-6">
          <button
            onClick={() => handleMobileNavigation('prev')}
            className="p-3 rounded-full bg-white shadow-2xl hover:scale-125 transition-all duration-300 border-2 border-yellow-300"
            aria-label={t('navigation.previous')}
          >
            <ChevronLeft className="w-5 h-5 text-blue-700" strokeWidth={4} />
          </button>
          
          <div className="flex-1 text-center space-y-2">
            <span className="text-xs text-white font-black drop-shadow-lg" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
              {tabs.findIndex(tab => tab.id === activeTab) + 1} {t('navigation.of')} {tabs.length}
            </span>
            <div className="flex justify-center gap-1.5">
              {tabs.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    tabs.findIndex(tab => tab.id === activeTab) === index
                      ? 'w-7 bg-yellow-300 shadow-lg'
                      : 'w-1.5 bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
          
          <button
            onClick={() => handleMobileNavigation('next')}
            className="p-3 rounded-full bg-white shadow-2xl hover:scale-125 transition-all duration-300 border-2 border-yellow-300"
            aria-label={t('navigation.next')}
          >
            <ChevronRight className="w-5 h-5 text-blue-700" strokeWidth={4} />
          </button>
        </div>

        {/* Content - estilo HeroCarousel */}
        <div className="flex-1 mb-6">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-yellow-300">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 p-6 lg:p-10 items-center">
              
              {/* Text Content */}
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 rounded-full border-2 border-yellow-300 shadow-xl">
                  {(() => {
                    const IconComponent = iconMap[activeTab] || BookOpen;
                    return <IconComponent className="w-4 h-4 text-blue-600 animate-pulse" />;
                  })()}
                  <span className="text-sm font-black text-blue-700 tracking-wide" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                    {activeTabData?.label}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 
                    className="text-2xl sm:text-3xl lg:text-4xl font-black text-blue-700 leading-tight"
                    style={{ fontFamily: 'Comic Sans MS, cursive' }}
                  >
                    {activeTabData?.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-12 bg-yellow-300 rounded-full" />
                    <div className="h-1.5 w-7 bg-green-300 rounded-full" />
                    <div className="h-1.5 w-4 bg-blue-300 rounded-full" />
                  </div>
                </div>
                
                <p 
                  className="text-base lg:text-lg text-slate-700 leading-relaxed font-bold"
                  style={{ fontFamily: 'Comic Sans MS, cursive' }}
                >
                  {activeTabData?.content}
                </p>
                
                <button className="group relative px-7 py-3.5 bg-yellow-300 text-blue-700 font-black text-base rounded-full shadow-2xl hover:shadow-yellow-400/50 transition-all duration-300 hover:scale-110 border-2 border-white overflow-hidden" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                  <span className="relative z-10 flex items-center gap-2">
                    {t('button')}
                    <Sparkles className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              </div>

              {/* Image */}
              <div className="relative">
                <div className="absolute -inset-5 bg-gradient-to-r from-yellow-300 via-orange-300 to-yellow-300 rounded-full blur-3xl opacity-60 animate-pulse" />
                <div className="relative bg-white rounded-3xl p-3 shadow-2xl border-4 border-yellow-300">
                  {Object.entries(imageMap).map(([tabId, imageSrc]) => {
                    const isActive = activeTab === tabId;
                    return (
                      <div
                        key={tabId}
                        className={`transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'}`}
                      >
                        <NextImage
                          src={imageSrc}
                          alt={tabs.find(tab => tab.id === tabId)?.title || 'Feature'}
                          width={500}
                          height={400}
                          className="rounded-2xl object-cover w-full h-64 lg:h-80"
                          priority={tabId === 'our_difference' || tabId === 'for_students'}
                          quality={85}
                          sizes="(max-width: 640px) 90vw, 45vw"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats - estilo HeroCarousel */}
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat: Stat, index: number) => {
            const icons: LucideIcon[] = [BookOpen, Zap, Award];
            const IconComponent = icons[index];
            const colors = ['yellow', 'green', 'blue'];
            const colorClass = colors[index];

            return (
              <div 
                key={index} 
                className={`group text-center p-4 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-3 border-${colorClass}-300`}
              >
                <div className={`w-14 h-14 bg-${colorClass}-100 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300 border-2 border-${colorClass}-300`}>
                  <IconComponent className={`w-7 h-7 text-${colorClass}-500`} strokeWidth={2.5} />
                </div>
                <h4 className="text-2xl lg:text-3xl font-black text-blue-700 mb-1" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                  {stat.number}
                </h4>
                <p className="text-xs lg:text-sm text-slate-600 font-bold" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;