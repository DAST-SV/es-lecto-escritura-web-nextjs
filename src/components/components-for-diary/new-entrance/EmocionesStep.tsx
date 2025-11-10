import { EmocionesStepProps } from '@/src/typings/types-diary/types';

export const EmocionesStep: React.FC<EmocionesStepProps> = ({ 
  emociones, 
  emocionesSeleccionadas, 
  onToggleEmocion 
}) => (
  <div className="space-y-6">
    <div className="text-center mb-6">
      <div className="text-6xl mb-4">😊</div>
      <h2 className="text-3xl font-black text-gray-800 mb-2">¿Cómo te sentiste hoy?</h2>
      <p className="text-gray-600 text-lg">Puedes seleccionar varias emociones</p>
    </div>

    <div className="grid grid-cols-5 gap-4">
      {emociones.map((emocion) => (
        <button
          key={emocion.id_emocion}
          onClick={() => onToggleEmocion(emocion.id_emocion)}
          type="button"
          className={`p-5 rounded-2xl border-3 transition-all hover:scale-105 ${
            emocionesSeleccionadas.includes(emocion.id_emocion)
              ? 'border-purple-500 shadow-xl scale-105 ring-2 ring-purple-200'
              : 'border-gray-300 hover:border-purple-300'
          }`}
          style={{
            backgroundColor: emocionesSeleccionadas.includes(emocion.id_emocion)
              ? `${emocion.color}20`
              : 'white'
          }}
        >
          <div className="text-5xl mb-2">{emocion.icono}</div>
          <div className="text-xs font-bold text-gray-700">{emocion.nombre}</div>
        </button>
      ))}
    </div>

    {emocionesSeleccionadas.length > 0 && (
      <div className="text-center bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
        <p className="text-lg font-black text-purple-600">
          {emocionesSeleccionadas.length} {emocionesSeleccionadas.length === 1 ? 'emoción seleccionada' : 'emociones seleccionadas'}
        </p>
      </div>
    )}
  </div>
);