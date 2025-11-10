import { ChevronLeft, ChevronRight } from 'lucide-react';
import { NavigationButtonsProps } from '@/src/typings/types-diary/types';

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({ 
  paso, 
  cargando, 
  onRetroceder, 
  onAvanzar 
}) => (
  <div className="flex gap-4 mt-8 pt-6 border-t-2 border-purple-100">
    <button
      onClick={onRetroceder}
      disabled={paso === 1 || cargando}
      className="flex items-center gap-2 px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 border-gray-300"
    >
      <ChevronLeft className="w-5 h-5" />
      Anterior
    </button>
    
    <button
      onClick={onAvanzar}
      disabled={cargando}
      className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-bold text-lg transition-all disabled:opacity-50 shadow-lg"
    >
      {cargando ? (
        <>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
          Creando...
        </>
      ) : paso === 4 ? (
        <>
          ✨ Empezar a escribir
        </>
      ) : (
        <>
          Siguiente
          <ChevronRight className="w-5 h-5" />
        </>
      )}
    </button>
  </div>
);