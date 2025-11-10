import { ClimaStepProps }from '@/src/typings/types-diary/types';

export const ClimaStep: React.FC<ClimaStepProps> = ({ 
  climas, 
  climaSeleccionado, 
  onClimaChange 
}) => (
  <div className="space-y-6">
    <div className="text-center mb-6">
      <div className="text-6xl mb-4">🌤️</div>
      <h2 className="text-3xl font-black text-gray-800 mb-2">¿Cómo estuvo el clima?</h2>
      <p className="text-gray-600 text-lg">Último paso antes de empezar a escribir</p>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {climas.map((climaOpcion) => {
        const Icon = climaOpcion.icon;
        return (
          <button
            key={climaOpcion.nombre}
            onClick={() => onClimaChange(climaOpcion.nombre)}
            type="button"
            className={`p-6 rounded-2xl border-3 transition-all hover:scale-105 ${
              climaSeleccionado === climaOpcion.nombre
                ? 'border-purple-500 shadow-xl scale-105 ring-2 ring-purple-200'
                : 'border-gray-300'
            } ${climaOpcion.color}`}
          >
            <Icon className="w-14 h-14 mx-auto mb-2" />
            <div className="text-sm font-bold text-gray-700">{climaOpcion.nombre}</div>
          </button>
        );
      })}
    </div>
  </div>
);