// PageHeader.tsx
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { ContentCategory } from './types';

interface PageHeaderProps {
  category: ContentCategory;
  onBack?: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ category, onBack }) => {
  return (
    <>
      {/* Navigation */}
      {onBack && (
        <nav className="px-6 md:px-16 py-6 bg-white/80 backdrop-blur-sm border-b border-gray-200" role="navigation">
          <button 
            onClick={onBack}
            className="flex items-center gap-3 text-blue-600 hover:text-blue-800 transition-colors font-semibold text-lg bg-blue-50 hover:bg-blue-100 px-6 py-3 rounded-full shadow-md hover:shadow-lg transform hover:scale-105"
            aria-label="Volver a la página anterior"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </button>
        </nav>
      )}

      {/* Header */}
      <header className="py-12 px-6 md:px-16">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8">
            <div className="text-8xl" role="img" aria-label={category.name}>
              {category.icon}
            </div>
            <div>
              <h1 className="text-4xl md:text-6xl font-black text-gray-800 mb-4">
                {category.name}
              </h1>
              <div className={`inline-block bg-gradient-to-r ${category.bgGradient} text-white px-6 py-3 rounded-full text-lg font-bold shadow-lg`}>
                Por Niveles de Edad
              </div>
            </div>
          </div>
          <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
            {category.description}
          </p>
        </div>
      </header>
    </>
  );
};

export default PageHeader;