/**
 * FeaturesSection Component
 * @file src/presentation/features/home/components/FeaturesSection/FeaturesSection.tsx
 * @description Features section matching HeroCarousel's visual style EXACTLY
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BookOpen, Zap, Award, Users, DollarSign, LucideIcon, ChevronLeft, ChevronRight } from 'lucide-react';

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
    className="relative flex flex-col justify-center"
    style={{ height: 'calc(100vh - 60px)' }}
  >
    <div className="container mx-auto max-w-6xl relative z-10 px-4 py-4 flex flex-col h-full">
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
        <div className="bg-white/90 rounded-3xl shadow-2xl overflow-hidden border-4 border-white/40 p-6 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4 animate-pulse">
              <div className="h-8 bg-white/50 rounded-full w-40" />
              <div className="h-10 bg-white/50 rounded-lg w-full" />
              <div className="h-10 bg-white/50 rounded-lg w-4/5" />
              <div className="space-y-2">
                <div className="h-5 bg-white/50 rounded w-full" />
                <div className="h-5 bg-white/50 rounded w-11/12" />
              </div>
              <div className="h-12 bg-yellow-300/50 rounded-full w-44" />
            </div>
            <div className="relative h-64 bg-white/50 rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white/90 rounded-2xl p-4 text-center border-2 border-white/40 shadow-xl">
            <div className="animate-pulse space-y-2">
              <div className="w-14 h-14 bg-white/50 rounded-full mx-auto" />
              <div className="h-8 bg-white/50 rounded w-16 mx-auto" />
              <div className="h-4 bg-white/50 rounded w-24 mx-auto" />
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
      className="relative flex flex-col justify-center"
      style={{ height: 'calc(100vh - 60px)' }}
    >
      <div className="container mx-auto max-w-6xl relative z-10 px-4 py-4 flex flex-col h-full">

        {/* Título */}
        <div className="text-center mb-3">
          <h2
            className="text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight mb-2 drop-shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
            style={{
              fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif",
              textShadow: '3px 3px 0px rgba(0,0,0,0.3), 6px 6px 0px rgba(0,0,0,0.1)'
            }}
          >
            {t('title')}
          </h2>
          <div className="flex items-center justify-center gap-3">
            <div className="h-1 w-12 bg-yellow-300 rounded-full" />
            <div className="h-1 w-7 bg-green-300 rounded-full" />
            <div className="h-1 w-4 bg-blue-300 rounded-full" />
          </div>
        </div>

        {/* Desktop Tabs */}
        <div className="hidden md:flex justify-center gap-2 mb-3 flex-wrap">
          {tabs.map((tab: FeatureTab) => {
            const IconComponent = iconMap[tab.id as FeatureTabId] || BookOpen;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as FeatureTabId)}
                className={`btn-native group relative flex items-center gap-1.5 px-4 py-2 rounded-full font-black text-xs transition-all duration-300 border-2 active:scale-95 ${
                  isActive
                    ? 'bg-yellow-300 text-blue-700 border-white scale-105 shadow-lg'
                    : 'bg-white/90 text-blue-600 border-yellow-300 hover:bg-yellow-50 hover:scale-105'
                }`}
                style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}
              >
                <IconComponent className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center justify-between gap-2 mb-3">
          <button
            onClick={() => handleMobileNavigation('prev')}
            className="btn-native p-2 rounded-full bg-white/80 shadow-lg transition-all duration-200 border-2 border-yellow-300 active:scale-90"
            aria-label={t('navigation.previous')}
          >
            <ChevronLeft className="w-4 h-4 text-blue-700" strokeWidth={3} />
          </button>

          <div className="flex-1 text-center space-y-1">
            <span className="text-[10px] text-white font-black drop-shadow-lg" style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}>
              {tabs.findIndex(tab => tab.id === activeTab) + 1} {t('navigation.of')} {tabs.length}
            </span>
            <div className="flex justify-center gap-1">
              {tabs.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    tabs.findIndex(tab => tab.id === activeTab) === index
                      ? 'w-5 bg-yellow-300'
                      : 'w-1 bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>

          <button
            onClick={() => handleMobileNavigation('next')}
            className="btn-native p-2 rounded-full bg-white/80 shadow-lg transition-all duration-200 border-2 border-yellow-300 active:scale-90"
            aria-label={t('navigation.next')}
          >
            <ChevronRight className="w-4 h-4 text-blue-700" strokeWidth={3} />
          </button>
        </div>

        {/* Content Card */}
        <div className="flex-1 mb-3 min-h-0">
          <div className="card-native bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-yellow-300 h-full flex">
            <div className="flex flex-col sm:flex-row gap-4 p-4 lg:p-5 items-center w-full">

              {/* Text Content */}
              <div className="flex-1 space-y-2 min-w-0">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100 rounded-full border border-yellow-300">
                  {(() => {
                    const IconComponent = iconMap[activeTab] || BookOpen;
                    return <IconComponent className="w-3.5 h-3.5 text-blue-600" />;
                  })()}
                  <span className="text-xs font-black text-blue-700" style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}>
                    {activeTabData?.label}
                  </span>
                </div>

                <h3
                  className="text-lg sm:text-xl lg:text-2xl font-black text-blue-700 leading-tight"
                  style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}
                >
                  {activeTabData?.title}
                </h3>

                <p
                  className="text-xs lg:text-sm text-slate-700 leading-relaxed font-bold line-clamp-4"
                  style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}
                >
                  {activeTabData?.content}
                </p>

                <button className="btn-native group relative px-5 py-2 bg-yellow-300 text-blue-700 font-black text-xs rounded-full shadow-lg hover:shadow-yellow-400/50 transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-white overflow-hidden" style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}>
                  <span className="relative z-10">
                    {t('button')}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              </div>

              {/* Image — debajo en mobile, al lado en sm+ */}
              <div className="flex items-center flex-shrink-0 w-full sm:w-auto">
                <div className="relative bg-white rounded-xl p-1.5 shadow-md border-2 border-yellow-300 w-full sm:w-auto">
                  {Object.entries(imageMap).map(([tabId, imageSrc]) => {
                    const isTabActive = activeTab === tabId;
                    return (
                      <div
                        key={tabId}
                        className={`transition-opacity duration-500 ${isTabActive ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'}`}
                      >
                        <NextImage
                          src={imageSrc}
                          alt={tabs.find(tab => tab.id === tabId)?.title || 'Feature'}
                          width={320}
                          height={220}
                          className="rounded-lg object-cover w-full h-[120px] sm:w-[200px] sm:h-[140px] lg:w-[280px] lg:h-[200px]"
                          priority={tabId === 'our_difference' || tabId === 'for_students'}
                          quality={85}
                          sizes="(max-width: 639px) 90vw, (min-width: 640px) 280px"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 lg:gap-3">
          {stats.map((stat: Stat, index: number) => {
            const icons: LucideIcon[] = [BookOpen, Zap, Award];
            const IconComponent = icons[index];
            const colors = ['yellow', 'green', 'blue'];
            const colorClass = colors[index];

            return (
              <div
                key={index}
                className={`card-native group text-center p-2 lg:p-3 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg transition-all duration-300 border-2 border-${colorClass}-300 active:scale-95`}
              >
                <div className={`w-10 h-10 lg:w-12 lg:h-12 bg-${colorClass}-100 rounded-full flex items-center justify-center mx-auto mb-1 border-2 border-${colorClass}-300`}>
                  <IconComponent className={`w-5 h-5 lg:w-6 lg:h-6 text-${colorClass}-500`} strokeWidth={2.5} />
                </div>
                <h4 className="text-lg lg:text-2xl font-black text-blue-700" style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}>
                  {stat.number}
                </h4>
                <p className="text-[10px] lg:text-xs text-slate-600 font-bold" style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}>
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