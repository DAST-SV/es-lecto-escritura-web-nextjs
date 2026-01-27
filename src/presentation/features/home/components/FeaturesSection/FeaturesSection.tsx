/**
 * FeaturesSection Component
 * @file src/presentation/features/home/components/FeaturesSection/FeaturesSection.tsx
 * @description Features section with tabs for the home page
 */

'use client';

import React, { useState, useMemo } from 'react';
import { BookOpen, Zap, Award, LucideIcon } from 'lucide-react';

import { useSupabaseTranslations } from '@/src/presentation/features/translations/hooks/useSupabaseTranslations';
import { NextImage } from '@/src/presentation/components/ui/NextImage';
import { imagesConfig } from '@/src/infrastructure/config/images.config';

import type { FeatureTab, FeatureTabId, Stat } from '../../types';

// ============================================
// CONSTANTS
// ============================================

const TAB_IDS: FeatureTabId[] = ['personalized', 'simplified', 'flexibility'];

const ICON_MAP: Record<FeatureTabId, LucideIcon> = {
  personalized: BookOpen,
  simplified: Zap,
  flexibility: Award,
};

const STAT_ICONS: LucideIcon[] = [BookOpen, Zap, Award];
const STAT_COLORS: string[] = ['blue', 'green', 'yellow'];

// Default data (fallback)
const DEFAULT_TABS: FeatureTab[] = [
  { id: 'personalized', label: 'Personalized', title: 'Personalized Attention', content: 'We understand that each student is unique.' },
  { id: 'simplified', label: 'Simplified', title: 'Simplified Process', content: 'Our learning process is simple and effective.' },
  { id: 'flexibility', label: 'Flexibility', title: 'Flexibility & Transparency', content: 'We offer flexible schedules and clear communication.' },
];

const DEFAULT_STATS: Stat[] = [
  { number: '1000+', label: 'Active Students' },
  { number: '95%', label: 'Improvement Rate' },
  { number: '50+', label: 'Partner Institutions' },
];

// ============================================
// COMPONENT
// ============================================

export const FeaturesSection: React.FC = () => {
  const { t } = useSupabaseTranslations('features');
  const [activeTab, setActiveTab] = useState<FeatureTabId>('personalized');

  // Build tabs from individual translation keys
  const tabs = useMemo<FeatureTab[]>(() => {
    return TAB_IDS.map((id, i) => {
      const label = t(`tabs.${i}.label`);
      const title = t(`tabs.${i}.title`);
      const content = t(`tabs.${i}.content`);

      const hasTranslation = !label.startsWith('[') && !label.endsWith(']');

      if (hasTranslation) {
        return { id, label, title, content };
      }

      return DEFAULT_TABS[i];
    });
  }, [t]);

  // Build stats from individual translation keys
  const stats = useMemo<Stat[]>(() => {
    return Array.from({ length: 3 }, (_, i) => {
      const number = t(`stats.${i}.number`);
      const label = t(`stats.${i}.label`);

      const hasTranslation = !number.startsWith('[') && !number.endsWith(']');

      if (hasTranslation) {
        return { number, label };
      }

      return DEFAULT_STATS[i];
    });
  }, [t]);

  // Get header texts
  const title = t('title');
  const subtitle = t('subtitle');
  const buttonText = t('button');

  // Use fallbacks if translations not loaded
  const displayTitle = title.startsWith('[') ? 'What Makes Us Different' : title;
  const displaySubtitle = subtitle.startsWith('[') ? 'Why EslectoEscritura is different from other platforms' : subtitle;
  const displayButton = buttonText.startsWith('[') ? 'Learn More' : buttonText;

  const activeTabData = tabs.find((tab) => tab.id === activeTab) || DEFAULT_TABS[0];

  // ============================================
  // RENDER
  // ============================================

  return (
    <section className="py-16 px-8 md:px-16 bg-gray-50 relative overflow-hidden">
      {/* Decorative Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg
          className="absolute -left-20 top-10 text-blue-100"
          width="200"
          height="400"
          viewBox="0 0 200 400"
          fill="none"
        >
          <path
            d="M-50 50C-50 100 0 150 50 150C100 150 150 200 150 250C150 300 100 350 50 350"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            opacity="0.3"
          />
        </svg>
        <svg
          className="absolute -right-20 bottom-10 text-orange-100"
          width="200"
          height="400"
          viewBox="0 0 200 400"
          fill="none"
        >
          <path
            d="M250 350C250 300 200 250 150 250C100 250 50 200 50 150C50 100 100 50 150 50"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            opacity="0.3"
          />
        </svg>
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-blue-600 text-sm font-bold uppercase tracking-wide mb-3">
            {displayTitle}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight">
            {displaySubtitle}
          </h2>
        </div>

        {/* Tabs Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {tabs.map((tab) => {
            const IconComponent = ICON_MAP[tab.id];
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 shadow-md'
                }`}
              >
                <IconComponent className="w-5 h-5" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Content */}
            <div className="order-2 lg:order-1">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
                {activeTabData.title}
              </h3>
              <div className="text-gray-600 text-lg leading-relaxed">
                <p>{activeTabData.content}</p>
              </div>
              <div className="mt-8">
                <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold px-8 py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                  {displayButton}
                </button>
              </div>
            </div>

            {/* Image */}
            <div className="order-1 lg:order-2 text-center">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-green-400 rounded-2xl transform rotate-3 opacity-20" />
                <NextImage
                  src={imagesConfig.literacy.v1}
                  alt={activeTabData.title}
                  width={400}
                  height={320}
                  className="relative w-full max-w-md mx-auto h-80 object-fill rounded-2xl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {stats.map((stat, index) => {
            const IconComponent = STAT_ICONS[index];
            const color = STAT_COLORS[index];

            return (
              <div key={index} className="text-center p-6 bg-white rounded-xl shadow-lg">
                <div className={`w-16 h-16 bg-${color}-100 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <IconComponent className={`w-8 h-8 text-${color}-600`} />
                </div>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">{stat.number}</h4>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
