"use client";
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { BookOpen, Zap, Award, LucideIcon } from 'lucide-react';
import { eslectoescriturav1 } from '@/public/images';
import type { FeatureTab, Stat } from './type';

type TabId = 'personalized' | 'simplified' | 'flexibility';

const iconMap: Record<TabId, LucideIcon> = {
  'personalized': BookOpen,
  'simplified': Zap,
  'flexibility': Award
};

const FeaturesSection: React.FC = () => {
  const t = useTranslations('features');
  const tabs: FeatureTab[] = t.raw('tabs');
  const stats: Stat[] = t.raw('stats');
  const [activeTab, setActiveTab] = useState<TabId>('personalized');

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <section className="py-16 px-8 md:px-16 bg-gray-50 relative overflow-hidden">
      {/* Formas decorativas de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute -left-20 top-10 text-blue-100" width="200" height="400" viewBox="0 0 200 400" fill="none">
          <path d="M-50 50C-50 100 0 150 50 150C100 150 150 200 150 250C150 300 100 350 50 350"
            stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3" />
        </svg>
        <svg className="absolute -right-20 bottom-10 text-orange-100" width="200" height="400" viewBox="0 0 200 400" fill="none">
          <path d="M250 350C250 300 200 250 150 250C100 250 50 200 50 150C50 100 100 50 150 50"
            stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3" />
        </svg>
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center mb-12">
          <p className="text-blue-600 text-sm font-bold uppercase tracking-wide mb-3">
            {t('title')}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight">
            {t('subtitle')}
          </h2>
        </div>

        {/* Tabs Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {tabs.map((tab: FeatureTab) => {
            const IconComponent = iconMap[tab.id];
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
                {activeTabData?.title}
              </h3>
              <div className="text-gray-600 text-lg leading-relaxed">
                <p>{activeTabData?.content}</p>
              </div>
              <div className="mt-8">
                <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold px-8 py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                  {t('button')}
                </button>
              </div>
            </div>

            {/* Image */}
            <div className="order-1 lg:order-2 text-center">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-green-400 rounded-2xl transform rotate-3 opacity-20"></div>
                <Image
                  src={eslectoescriturav1}
                  alt={activeTabData?.title || 'Feature image'}
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
          {stats.map((stat: Stat, index: number) => {
            const icons: LucideIcon[] = [BookOpen, Zap, Award];
            const colors: string[] = ['blue', 'green', 'yellow'];
            const IconComponent = icons[index];
            const color = colors[index];
            
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