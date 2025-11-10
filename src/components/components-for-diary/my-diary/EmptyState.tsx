import {EmptyStateProps } from '@/src/typings/types-diary/types'


export const EmptyState: React.FC<EmptyStateProps> = ({ 
  hasFilters, 
  onCreateNew 
}) => (
  <div className="text-center py-20">
    <div className="text-9xl mb-6">📝</div>
    <h2 className="text-3xl font-black text-purple-600 mb-4">
      {hasFilters
        ? '¡No encontramos diarios con esos filtros!'
        : '¡Aún no tienes diarios!'}
    </h2>
    <p className="text-xl text-gray-600 mb-8">
      {hasFilters
        ? 'Prueba con otros filtros 🔍'
        : 'Empieza a escribir tu primera aventura ✨'}
    </p>
    {!hasFilters && (
      <button
        onClick={onCreateNew}
        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-10 py-5 rounded-2xl font-black text-2xl shadow-xl hover:scale-105 transition-all"
      >
        ✨ Crear mi primer diario
      </button>
    )}
  </div>
);