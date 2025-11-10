import {DiaryCardProps} from '@/src/typings/types-diary/types'

export const DiaryCard: React.FC<DiaryCardProps> = ({ 
  entrada, 
  onEdit, 
  onDelete, 
  onToggleFavorito 
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border-4 border-purple-200 overflow-hidden transform hover:scale-105 transition-all cursor-pointer relative group aspect-square flex flex-col">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorito(entrada.id_entrada, entrada.es_favorito);
        }}
        className="absolute top-4 right-4 z-10 text-3xl hover:scale-125 transition-all"
      >
        {entrada.es_favorito ? '⭐' : '☆'}
      </button>

      <div
        className="p-6 text-white relative flex-shrink-0"
        style={{
          background: `linear-gradient(135deg, ${entrada.color_emocion || '#9333ea'} 0%, ${entrada.color_emocion || '#ec4899'}dd 100%)`
        }}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="text-6xl">{entrada.icono_emocion || '😊'}</div>
          <div className="text-right">
            <div className="text-4xl mb-1">
              {'⭐'.repeat(entrada.calificacion_dia || 0)}
            </div>
            {entrada.clima && (
              <div className="text-3xl">{entrada.clima.split(' ')[0]}</div>
            )}
          </div>
        </div>
        <h3 className="text-xl font-black mb-1 line-clamp-1">
          {entrada.titulo || 'Sin título'}
        </h3>
        <p className="text-white/90 text-sm font-semibold">
          {formatDate(entrada.fecha)}
        </p>
      </div>

      <div
        className="p-6 flex-1 flex flex-col"
        onClick={() => onEdit(entrada.id_entrada)}
      >
        <p className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-3 flex-1">
          {entrada.contenido_preview || 'Esta entrada aún está vacía...'}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-500 font-semibold">
          <span>📄 {entrada.total_paginas} página{entrada.total_paginas !== 1 ? 's' : ''}</span>
          <span>{entrada.emocion}</span>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-all flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(entrada.id_entrada);
          }}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-xl font-bold text-sm"
        >
          ✏️ Editar
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(entrada.id_entrada);
          }}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-xl font-bold text-sm"
        >
          🗑️ Eliminar
        </button>
      </div>
    </div>
  );
};