import React, { useState } from 'react';
import { BookOpen, Zap, Award } from 'lucide-react';

const TabsSection = () => {
  const [activeTab, setActiveTab] = useState('personalized');

  const tabs = [
    {
      id: 'personalized',
      label: 'Atención Personalizada',
      title: 'Atención Personalizada',
      content: 'Entendemos que cada estudiante es único. Ofrecemos soluciones educativas personalizadas que se adaptan a las necesidades individuales de aprendizaje de cada alumno.',
      icon: BookOpen,
      image: '/hero/slide1.png'
    },
    {
      id: 'simplified',
      label: 'Proceso Simplificado',
      title: 'Proceso Simplificado',
      content: 'Nuestro proceso de aprendizaje es sencillo y efectivo, diseñado para minimizar la complejidad y maximizar el tiempo de comprensión lectora.',
      icon: Zap,
      image: '/hero/slide2.png'
    },
    {
      id: 'flexibility',
      label: 'Flexibilidad y Transparencia',
      title: 'Flexibilidad y Transparencia',
      content: 'Ofrecemos horarios flexibles y nos esforzamos por mantener una comunicación clara y transparente con padres y educadores sobre el progreso de cada estudiante.',
      icon: Award,
      image: '/hero/slide1.png'
    }
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <section className="py-16 px-8 md:px-16 bg-gray-50 relative overflow-hidden">
      {/* Formas decorativas de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute -left-20 top-10 text-purple-100" width="200" height="400" viewBox="0 0 200 400" fill="none">
          <path d="M-50 50C-50 100 0 150 50 150C100 150 150 200 150 250C150 300 100 350 50 350" 
                stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3"/>
        </svg>
        <svg className="absolute -right-20 bottom-10 text-cyan-100" width="200" height="400" viewBox="0 0 200 400" fill="none">
          <path d="M250 350C250 300 200 250 150 250C100 250 50 200 50 150C50 100 100 50 150 50" 
                stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3"/>
        </svg>
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center mb-12">
          <p className="text-purple-600 text-sm font-bold uppercase tracking-wide mb-3">
            QUE NOS DIFERENCIA DE LOS DEMÁS
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight">
            Porque EslectoEscritura es diferente que otras plataformas educativas
          </h2>
        </div>

        {/* Tabs Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-600 shadow-md'
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
                <button className="bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold px-8 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                  Conoce Más
                </button>
              </div>
            </div>

            {/* Image */}
            <div className="order-1 lg:order-2 text-center">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-2xl transform rotate-3 opacity-20"></div>
                <img
                  src={activeTabData?.image}
                  alt={activeTabData?.title}
                  className="relative w-full max-w-md mx-auto h-80 object-contain rounded-2xl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats o información adicional */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="text-center p-6 bg-white rounded-xl shadow-lg">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-purple-600" />
            </div>
            <h4 className="text-xl font-semibold text-gray-800 mb-2">1000+</h4>
            <p className="text-gray-600">Estudiantes Activos</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-xl shadow-lg">
            <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-cyan-600" />
            </div>
            <h4 className="text-xl font-semibold text-gray-800 mb-2">95%</h4>
            <p className="text-gray-600">Mejora en Comprensión</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-xl shadow-lg">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-yellow-600" />
            </div>
            <h4 className="text-xl font-semibold text-gray-800 mb-2">50+</h4>
            <p className="text-gray-600">Instituciones Aliadas</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TabsSection;