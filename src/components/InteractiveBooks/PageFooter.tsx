// PageFooter.tsx
import React from 'react';

const PageFooter: React.FC = () => {
  return (
    <footer className="py-12 px-6 md:px-16 bg-white/80" role="contentinfo">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-6 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl">
            <div className="text-3xl font-black text-blue-600 mb-2">500+</div>
            <div className="text-gray-700 font-semibold">Cuentos</div>
          </div>
          <div className="p-6 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl">
            <div className="text-3xl font-black text-green-600 mb-2">3-12</div>
            <div className="text-gray-700 font-semibold">Años</div>
          </div>
          <div className="p-6 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl">
            <div className="text-3xl font-black text-purple-600 mb-2">15K+</div>
            <div className="text-gray-700 font-semibold">Lectores</div>
          </div>
          <div className="p-6 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl">
            <div className="text-3xl font-black text-yellow-600 mb-2">4.9⭐</div>
            <div className="text-gray-700 font-semibold">Rating</div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PageFooter;