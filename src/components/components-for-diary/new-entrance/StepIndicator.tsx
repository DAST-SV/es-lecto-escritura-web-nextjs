import { StepIndicatorProps } from '@/src/typings/types-diary/types';

export const StepIndicator: React.FC<StepIndicatorProps> = ({ pasos, pasoActual }) => (
  <div className="bg-white rounded-2xl shadow-md border-2 border-purple-100 p-6 mb-6">
    <div className="flex items-center justify-between">
      {pasos.map((p, index) => (
        <div key={p.numero} className="flex items-center flex-1">
          <div className={`flex flex-col items-center flex-1 ${index < pasos.length - 1 ? 'relative' : ''}`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base transition-all ${
              p.numero < pasoActual ? 'bg-green-500 text-white' :
              p.numero === pasoActual ? 'bg-purple-500 text-white ring-4 ring-purple-200 scale-110' :
              'bg-gray-200 text-gray-500'
            }`}>
              {p.numero < pasoActual ? '✓' : p.numero}
            </div>
            <div className="text-center mt-2">
              <p className={`text-sm font-bold ${p.numero === pasoActual ? 'text-purple-600' : 'text-gray-600'}`}>
                {p.titulo}
              </p>
              <p className="text-xs text-gray-500 hidden md:block">{p.descripcion}</p>
            </div>
          </div>
          {index < pasos.length - 1 && (
            <div className={`h-1 flex-1 mx-2 transition-all rounded-full ${
              p.numero < pasoActual ? 'bg-green-500' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  </div>
);
