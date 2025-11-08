"use client";
import React from 'react';
import { useTranslations } from 'next-intl';
import { ArrowRight, Sparkles } from 'lucide-react';

const CTASection: React.FC = () => {
  const t = useTranslations('cta');

  return (
    <section className="relative py-20 lg:py-24 px-4 md:px-8 lg:px-16 overflow-hidden">
      {/* Fondo con gradiente profesional */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-600"></div>
      
      {/* Patrón decorativo sutil */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }}></div>

      {/* Elementos decorativos modernos */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Badge superior */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 mb-6 lg:mb-8">
          <Sparkles className="w-4 h-4 text-white" />
          <span className="text-sm font-bold text-white tracking-wide">
            Comienza Hoy Mismo
          </span>
        </div>

        {/* Título impactante */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-white leading-tight mb-6 lg:mb-8 drop-shadow-lg">
          {t('title')}
        </h2>

        {/* Descripción */}
        <p className="text-lg sm:text-xl lg:text-2xl text-white/95 mb-8 lg:mb-10 leading-relaxed font-medium max-w-2xl mx-auto drop-shadow">
          {t('description')}
        </p>

        {/* CTA Button destacado */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="group relative inline-flex items-center gap-3 bg-white text-teal-700 font-black px-8 lg:px-10 py-4 lg:py-5 rounded-2xl shadow-2xl hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-all duration-300 hover:scale-105 text-base lg:text-lg overflow-hidden">
            <span className="relative z-10">{t('button')}</span>
            <ArrowRight className="relative z-10 w-5 h-5 lg:w-6 lg:h-6 group-hover:translate-x-1 transition-transform" />
            
            {/* Efecto hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-cyan-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>

          {/* Badge de confianza */}
          <div className="flex items-center gap-2 text-white/90 text-sm font-semibold">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-white flex items-center justify-center text-xs">👦</div>
              <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-white flex items-center justify-center text-xs">👧</div>
              <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-white flex items-center justify-center text-xs">🧒</div>
            </div>
            <span className="drop-shadow">+1000 niños aprendiendo</span>
          </div>
        </div>

        {/* Características destacadas */}
        <div className="mt-10 lg:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 max-w-3xl mx-auto">
          {[
            { icon: '✓', text: 'Sin publicidad' },
            { icon: '✓', text: 'Contenido seguro' },
            { icon: '✓', text: 'Gratis para siempre' }
          ].map((feature, index) => (
            <div 
              key={index}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20"
            >
              <span className="text-lg font-bold text-white">{feature.icon}</span>
              <span className="text-sm lg:text-base font-semibold text-white">{feature.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CTASection;