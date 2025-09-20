"use client";
import React from 'react';
import { useTranslations } from 'next-intl';

const CTASection: React.FC = () => {
  const t = useTranslations('cta');

  return (
    <section className="py-16 px-8 md:px-16 bg-gradient-to-r from-blue-50 to-green-50">
      <div className="max-w-4xl mx-auto text-center">
        <h3 className="text-3xl md:text-4xl font-bold mb-8 text-gray-800">
          {t('title')}
        </h3>
        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
          {t('description')}
        </p>
        <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold px-10 py-4 rounded-xl shadow-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 text-lg">
          {t('button')}
        </button>
      </div>
    </section>
  );
};

export default CTASection;