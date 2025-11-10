import { Star } from 'lucide-react';
import { CalificacionStepProps } from '@/src/typings/types-diary/types';
import { ca } from 'date-fns/locale';

export const CalificacionStep: React.FC<CalificacionStepProps> = ({ 
  calificacion, 
  onCalificacionChange 
}) => {
  const obtenerMensaje = (cal: number): string => {
    const mensajes: { [key: number]: string } = {
      5: 'Día excelente',
      4: 'Muy buen día',
      3: 'Día normal',
      2: 'Día difícil',
      1: 'Día complicado'
    };
    return mensajes[cal] || '';
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="text-6xl mb-4">⭐</div>
        <h2 className="text-3xl font-black text-gray-800 mb-2">Califica tu día</h2>
        <p className="text-gray-600 text-lg">¿Qué tan bueno fue?</p>
      </div>

      <div className="flex justify-center gap-4 my-12">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onCalificacionChange(star)}
            type="button"
            className="transition-all hover:scale-125"
          >
            <Star
              className={`w-16 h-16 ${
                star <= calificacion
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-gray-300 hover:text-amber-300'
              }`}
            />
          </button>
        ))}
      </div>

      {calificacion > 0 && (
        <div className="text-center bg-amber-50 border-2 border-amber-300 rounded-2xl p-5">
          <p className="text-2xl font-black text-amber-700">
            {obtenerMensaje(calificacion)}
          </p>
        </div>
      )}
    </div>
  );
};