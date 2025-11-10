import { SearchAndFiltersProps } from '@/src/typings/types-diary/types';
import {  type FiltroEmocion} from '@/src/typings/types-diary/types';

export const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  busqueda,
  onBusquedaChange,
  filtroEmocion,
  onFiltroEmocionChange,
  filtroCalificacion,
  onFiltroCalificacionChange,
  ordenFecha,
  onOrdenFechaToggle,
  mostrarFiltros,
  onToggleFiltros
}) => (
  <div className="bg-white rounded-3xl shadow-xl p-6 mb-8 border-4 border-purple-200">
    <div className="flex flex-col md:flex-row gap-4 items-center">
      <div className="flex-1 relative">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => onBusquedaChange(e.target.value)}
          placeholder="🔍 Buscar en tus diarios..."
          className="w-full px-6 py-4 border-4 border-purple-300 rounded-2xl text-lg focus:border-purple-500 focus:outline-none font-semibold"
        />
      </div>

      <button
        onClick={onToggleFiltros}
        className={`px-6 py-4 rounded-2xl font-bold text-lg transition-all border-4 ${
          mostrarFiltros
            ? 'bg-purple-500 text-white border-purple-600'
            : 'bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-200'
        }`}
      >
        🎨 Filtros {(filtroCalificacion || filtroEmocion !== 'todas') && '✓'}
      </button>

      <button
        onClick={onOrdenFechaToggle}
        className="px-6 py-4 bg-orange-100 hover:bg-orange-200 border-4 border-orange-300 rounded-2xl font-bold text-lg text-orange-700 transition-all"
      >
        {ordenFecha === 'recientes' ? '🔽 Más recientes' : '🔼 Más antiguas'}
      </button>
    </div>

    {mostrarFiltros && (
      <div className="mt-6 pt-6 border-t-4 border-purple-200 animate-fadeIn">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-lg font-bold text-purple-700 mb-3">😊 Tipo de emoción:</label>
            <div className="flex gap-2">
              {[
                { value: 'todas', label: 'Todas', emoji: '🌈' },
                { value: 'positivas', label: 'Positivas', emoji: '😊' },
                { value: 'negativas', label: 'Negativas', emoji: '😔' }
              ].map(opcion => (
                <button
                  key={opcion.value}
                  onClick={() => onFiltroEmocionChange(opcion.value as FiltroEmocion)}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all border-4 ${
                    filtroEmocion === opcion.value
                      ? 'bg-purple-500 text-white border-purple-600 scale-105'
                      : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {opcion.emoji} {opcion.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-lg font-bold text-purple-700 mb-3">⭐ Calificación:</label>
            <div className="flex gap-2">
              <button
                onClick={() => onFiltroCalificacionChange(null)}
                className={`px-4 py-3 rounded-xl font-bold transition-all border-4 ${
                  !filtroCalificacion
                    ? 'bg-purple-500 text-white border-purple-600 scale-105'
                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                }`}
              >
                Todas
              </button>
              {[5, 4, 3, 2, 1].map(num => (
                <button
                  key={num}
                  onClick={() => onFiltroCalificacionChange(num)}
                  className={`px-4 py-3 rounded-xl font-bold transition-all border-4 ${
                    filtroCalificacion === num
                      ? 'bg-yellow-400 text-yellow-900 border-yellow-600 scale-105'
                      : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {num}⭐
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);