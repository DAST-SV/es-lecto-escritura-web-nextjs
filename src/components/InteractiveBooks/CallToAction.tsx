// CallToAction.tsx
import React from 'react';
import { ContentCategory } from './types';

interface CallToActionProps {
  category: ContentCategory;
  onViewPlans?: () => void;
  onStartTrial?: () => void;
}

const CallToAction: React.FC<CallToActionProps> = ({ 
  category, 
  onViewPlans, 
  onStartTrial 
}) => {
  return (
    <div className="text-center mt-16">
      <div className={`bg-gradient-to-r ${category.bgGradient} text-white rounded-3xl p-12 shadow-2xl`}>
        <h3 className="text-4xl font-black mb-6">
          Desbloquea Toda la Biblioteca
        </h3>
        <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto leading-relaxed">
          Accede a cientos de cuentos con narración interactiva, seguimiento de progreso 
          y experiencias adaptadas a cada edad.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
          <button 
            onClick={onViewPlans}
            className="bg-white text-gray-800 font-bold text-lg px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            Ver Planes
          </button>
          <button 
            onClick={onStartTrial}
            className="border-2 border-white text-white font-bold text-lg px-8 py-4 rounded-2xl hover:bg-white hover:text-gray-800 transition-all transform hover:scale-105"
          >
            Prueba Gratis
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallToAction;